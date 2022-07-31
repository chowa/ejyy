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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';

interface RequestParams {
    id: number;
}

const PcHrLeaveAction = <Action>{
    router: {
        path: '/hr/leave/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        params: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const info = await ctx.model
            .from('ejyy_property_company_user')
            .where('id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取人事信息'
            });
        }

        if (info.leave_office === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '人事状态错误'
            });
        }

        // 如果是流程审批人不能离职
        const workflowApproverUser = await ctx.model
            .from('ejyy_workflow')
            .leftJoin('ejyy_workflow_node', 'ejyy_workflow_node.workflow_id', 'ejyy_workflow.id')
            .where('ejyy_workflow.latest', TRUE)
            .andWhere('ejyy_workflow_node.relation_user_id', id)
            .first();

        if (workflowApproverUser) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '该员工是流程审批人，不能办理离职'
            });
        }

        const affect = await ctx.model
            .from('ejyy_property_company_user')
            .update('leave_office', TRUE)
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '人事离职失败'
            });
        }

        const created_at = Date.now();

        await ctx.model.from('ejyy_property_company_user_join_record').insert({
            property_company_user_id: id,
            status: TRUE,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            message: '人事离职成功',
            data: {
                created_at
            }
        };
    }
};

export default PcHrLeaveAction;
