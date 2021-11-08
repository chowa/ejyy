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
import moment from 'moment';
import { LEAVE_WORKFLOW, WORKFLOW_NODE_NOTICE, WORKFLOW_NODE_APPROVER } from '~/constant/workflow';

interface RequestBody {
    begin_date: number;
    total: number;
    reason: string;
    community_id: number;
}

const PcLeaveCreateAction = <Action>{
    router: {
        path: '/leave/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'begin_date',
                required: true,
                regex: /^\d{13}$/
            },
            {
                name: 'total',
                required: true,
                regex: /^\d(\.\d+)?$/
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
            }
        ]
    },
    response: async ctx => {
        const { begin_date, total, reason, community_id } = <RequestBody>ctx.request.body;

        const generater = await workflowService.generateSteps(
            ctx.model,
            ctx.pcUserInfo,
            total,
            community_id,
            LEAVE_WORKFLOW
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
        const [id] = await ctx.model.from('ejyy_ask_for_leave').insert({
            community_id,
            created_by: ctx.pcUserInfo.id,
            workflow_id: generater.workflow_id,
            begin_date: moment(begin_date)
                .startOf('day')
                .valueOf(),
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
                    refer: 'leave',
                    title: '员工请假申请',
                    relation_user_id: step.relation_user_id,
                    created_by: ctx.pcUserInfo.id,
                    time: moment(created_at).format('YYYY-MM-DD HH:mm:ss'),
                    digest: `${moment(begin_date).format('YYYY-MM-DD')}请假${total}天`
                });
            }

            return {
                ...step,
                parent_id: id,
                finished_at:
                    step.node_type === WORKFLOW_NODE_NOTICE && step.step < generater.currentStep ? created_at : null
            };
        });

        await ctx.model.from('ejyy_ask_for_leave_flow').insert(insertDta);

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcLeaveCreateAction;
