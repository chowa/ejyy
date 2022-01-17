/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { WORKFLOW_NODE_NOTICE, WORKFLOW_NODE_APPROVER } from '~/constant/workflow';
import { TRUE, FALSE } from '~/constant/status';
import * as workflowService from '~/service/workflow';
import moment from 'moment';
import utils from '~/utils';

interface RequestBody {
    id: number;
    node_id: number;
    agree: typeof TRUE | typeof FALSE;
    reason: string;
    community_id: number;
}

const PcPurchaseFlowAction = <Action>{
    router: {
        path: '/purchase/flow',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'node_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'agree',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'reason',
                max: 128
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, node_id, agree, reason, community_id } = <RequestBody>ctx.request.body;

        const flowInfo = await ctx.model
            .from('ejyy_material_purchase')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!flowInfo || flowInfo.cancel === TRUE) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改流程'
            });
        }

        const flowNodes = await ctx.model.from('ejyy_material_purchase_flow').where('parent_id', id);
        const index = flowNodes.findIndex(step => step.id === node_id);

        if (index < 0 || flowNodes[index].step !== flowInfo.step || flowNodes[index].finish === TRUE) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改流程'
            });
        }

        const finished_at = Date.now();
        await ctx.model
            .from('ejyy_material_purchase_flow')
            .where('id', node_id)
            .update({
                finish: TRUE,
                refuse_reason: reason ? reason : null,
                finished_at
            });

        if (agree === FALSE) {
            await ctx.model
                .from('ejyy_material_purchase')
                .where('id', id)
                .update({ success: FALSE, step: flowNodes[index].step });

            workflowService.noticeResult(ctx.model, {
                id,
                refer: 'purchase',
                success: FALSE,
                reason,
                created_by: flowInfo.created_by,
                time: moment(finished_at).format('YYYY-MM-DD HH:mm:ss'),
                digest: utils.text.omit(flowInfo.remark, 20)
            });
        } else {
            for (const node of flowNodes) {
                if (node.step <= flowInfo.step) {
                    continue;
                } else {
                    if (node.node_type === WORKFLOW_NODE_APPROVER) {
                        await ctx.model
                            .from('ejyy_material_purchase')
                            .where('id', id)
                            .update({ step: node.step });

                        workflowService.noticeApprover(ctx.model, {
                            id,
                            refer: 'purchase',
                            title: '物料采购申请',
                            relation_user_id: node.relation_user_id,
                            created_by: ctx.pcUserInfo.id,
                            time: moment(flowInfo.created_at).format('YYYY-MM-DD HH:mm:ss'),
                            digest: utils.text.omit(flowInfo.remark, 20)
                        });
                        break;
                    } else if (node.node_type === WORKFLOW_NODE_NOTICE) {
                        await ctx.model
                            .from('ejyy_material_purchase_flow')
                            .where('id', node.id)
                            .update({ finish: TRUE, finished_at });
                        // 添加推送抄送
                    } else {
                        await ctx.model
                            .from('ejyy_material_purchase_flow')
                            .where('id', node.id)
                            .update({ finish: TRUE });
                    }
                }
            }

            const complete = await ctx.model
                .from('ejyy_material_purchase_flow')
                .where('parent_id', id)
                .orderBy('id', 'desc')
                .first();

            if (complete.finish === TRUE) {
                await ctx.model
                    .from('ejyy_material_purchase')
                    .where('id', id)
                    .update({ step: complete.step, success: TRUE });

                await ctx.model
                    .from('ejyy_material_purchase_item')
                    .where('task_id', id)
                    .update('finish', TRUE);

                workflowService.noticeResult(ctx.model, {
                    id,
                    refer: 'purchase',
                    success: TRUE,
                    reason: '',
                    created_by: flowInfo.created_by,
                    time: moment(finished_at).format('YYYY-MM-DD HH:mm:ss'),
                    digest: utils.text.omit(flowInfo.remark, 20)
                });

                // 加库存
                const items = await ctx.model.from('ejyy_material_purchase_item').where('task_id', id);

                for (const item of items) {
                    const material = await ctx.model
                        .from('ejyy_material')
                        .where('id', item.material_id)
                        .first();

                    if (material) {
                        await ctx.model
                            .from('ejyy_material')
                            .update('total', material.total + item.total)
                            .where('id', item.material_id);
                    }
                }
            }
        }

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcPurchaseFlowAction;
