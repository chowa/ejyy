/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WORKFLOW_NOT_EXIST, WORKFLOW_ILLEGAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import * as workflowService from '~/service/workflow';
import { REFOUND_WORKFLOW, WORKFLOW_NODE_NOTICE, WORKFLOW_NODE_APPROVER } from '~/constant/workflow';
import moment from 'moment';
import utils from '~/utils';

interface RefoundItem {
    reason: string;
    code: string;
    num: string;
    date: number;
    attachment_url: string;
    fee: number;
}

interface RequestBody {
    total: number;
    begin_date: number;
    finish_date: number;
    reason: string;
    community_id: number;
    items: RefoundItem[];
}

const PcRefoundCreateAction = <Action>{
    router: {
        path: '/refound/create',
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
                name: 'begin_date',
                required: true,
                regex: /^\d{13}$/
            },
            {
                name: 'finish_date',
                required: true,
                regex: /^\d{13}$/
            },
            {
                name: 'reason',
                required: true,
                max: 128
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

                    return val.every(({ reason, code, num, date, attachment_url, fee }) => {
                        if (!reason || reason.length > 56) return false;
                        if (!code || code.length > 56) return false;
                        if (!num || num.length > 56) return false;
                        if (!/^\d{13}$/.test(date)) return false;

                        if (
                            !attachment_url ||
                            !/^\/refound\/[a-z0-9]{32}\.(jpg|jpeg|png)/.test(attachment_url) ||
                            attachment_url.length > 128
                        )
                            return false;
                        if (!/^\d+(\.\d+)?$/.test(fee)) return false;

                        return true;
                    });
                }
            }
        ]
    },
    response: async ctx => {
        const { begin_date, finish_date, reason, community_id, total, items } = <RequestBody>ctx.request.body;

        const generater = await workflowService.generateSteps(
            ctx.model,
            ctx.pcUserInfo,
            total,
            community_id,
            REFOUND_WORKFLOW
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
        const [id] = await ctx.model.from('ejyy_refound').insert({
            community_id,
            created_by: ctx.pcUserInfo.id,
            workflow_id: generater.workflow_id,
            begin_date,
            finish_date,
            reason,
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
                    refer: 'refound',
                    title: '员工报销申请',
                    relation_user_id: step.relation_user_id,
                    created_by: ctx.pcUserInfo.id,
                    time: moment(created_at).format('YYYY-MM-DD HH:mm:ss'),
                    digest: utils.text.omit(reason, 20)
                });
            }

            return {
                ...step,
                parent_id: id,
                finished_at:
                    step.node_type === WORKFLOW_NODE_NOTICE && step.step < generater.currentStep ? created_at : null
            };
        });

        await ctx.model.from('ejyy_refound_flow').insert(insertDta);
        await ctx.model.from('ejyy_refound_item').insert(
            items.map(item => {
                return {
                    refound_id: id,
                    ...item
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

export default PcRefoundCreateAction;
