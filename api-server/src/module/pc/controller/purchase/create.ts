/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WORKFLOW_NOT_EXIST, WORKFLOW_ILLEGAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import * as workflowService from '~/service/workflow';
import { PURCHASE_WORKFLOW, WORKFLOW_NODE_NOTICE, WORKFLOW_NODE_APPROVER } from '~/constant/workflow';
import { MATERIAL_ORIGIN_BUY } from '~/constant/material';
import moment from 'moment';
import utils from '~/utils';

interface PurchaseItem {
    material_id: number;
    total: number;
    supplier_id?: number;
    fee: number;
}

interface RequestBody {
    total: number;
    remark?: string;
    items: PurchaseItem[];
    community_id: number;
}

const PcPurchaseCreateAction = <Action>{
    router: {
        path: '/purchase/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'total',
                required: true,
                regex: /^\d+(\.\d+)?$/
            },
            {
                name: 'remark',
                max: 512
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'items',
                required: true,
                min: 1,
                validator: val => {
                    if (!Array.isArray(val)) return false;

                    return val.every(({ material_id, total, supplier_id, fee }) => {
                        if (!/^\d+$/.test(material_id)) return false;
                        if (!/^\d+$/.test(total)) return false;
                        if (!/^\d+$/.test(supplier_id)) return false;

                        if (!/^\d+(\.\d+)?$/.test(fee)) return false;

                        return true;
                    });
                }
            }
        ]
    },
    response: async ctx => {
        const { total, remark, items, community_id } = <RequestBody>ctx.request.body;

        const generater = await workflowService.generateSteps(
            ctx.model,
            ctx.pcUserInfo,
            total,
            community_id,
            PURCHASE_WORKFLOW
        );

        if (!generater.workflow_id) {
            return (ctx.body = {
                code: WORKFLOW_NOT_EXIST,
                message: '未查询到可应用的流程，请联系管理员设置'
            });
        }

        if (!generater.currentStep) {
            return (ctx.body = {
                code: WORKFLOW_ILLEGAL,
                message: '当前工作流不能满足你的申请，请联系管理员重置工作流程'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_material_purchase').insert({
            community_id,
            created_by: ctx.pcUserInfo.id,
            workflow_id: generater.workflow_id,
            remark: remark ? remark : null,
            total,
            success: null,
            step: generater.currentStep,
            created_at
        });

        const insertDta = generater.steps.map(step => {
            if (step.node_type === WORKFLOW_NODE_NOTICE && step.step < generater.currentStep) {
                // 可以加抄送推送
            }
            if (
                step.node_type === WORKFLOW_NODE_APPROVER &&
                step.step === generater.currentStep &&
                step.relation_user_id
            ) {
                workflowService.noticeApprover(ctx.model, {
                    id,
                    refer: 'purchase',
                    title: '物料采购申请',
                    relation_user_id: step.relation_user_id,
                    created_by: ctx.pcUserInfo.id,
                    time: moment(created_at).format('YYYY-MM-DD HH:mm:ss'),
                    digest: utils.text.omit(remark, 20)
                });
            }

            return {
                ...step,
                parent_id: id,
                finished_at:
                    step.node_type === WORKFLOW_NODE_NOTICE && step.step < generater.currentStep ? created_at : null
            };
        });

        await ctx.model.from('ejyy_material_purchase_flow').insert(insertDta);
        await ctx.model.from('ejyy_material_purchase_item').insert(
            items.map(item => {
                return {
                    task_id: id,
                    ...item,
                    created_at,
                    origin: MATERIAL_ORIGIN_BUY,
                    created_by: ctx.pcUserInfo.id
                };
            })
        );

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcPurchaseCreateAction;
