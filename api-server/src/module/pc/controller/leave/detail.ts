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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcLeaveDetailAction = <Action>{
    router: {
        path: '/leave/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_ask_for_leave')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_ask_for_leave.created_by')
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .where('ejyy_ask_for_leave.id', id)
            .andWhere('ejyy_ask_for_leave.community_id', community_id)
            .select(
                'ejyy_ask_for_leave.id',
                'ejyy_ask_for_leave.created_by',
                'ejyy_ask_for_leave.begin_date',
                'ejyy_ask_for_leave.reason',
                'ejyy_ask_for_leave.total',
                'ejyy_ask_for_leave.step',
                'ejyy_ask_for_leave.success',
                'ejyy_ask_for_leave.cancel',
                'ejyy_ask_for_leave.canceled_at',
                'ejyy_ask_for_leave.created_at',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_department.name as department_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取请假详细'
            });
        }

        const steps = await ctx.model
            .from('ejyy_ask_for_leave_flow')
            .leftJoin('ejyy_workflow_node', 'ejyy_workflow_node.id', 'ejyy_ask_for_leave_flow.workflow_node_id')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_ask_for_leave_flow.relation_user_id'
            )
            .where('ejyy_ask_for_leave_flow.parent_id', id)
            .select(
                'ejyy_ask_for_leave_flow.id',
                'ejyy_ask_for_leave_flow.step',
                'ejyy_ask_for_leave_flow.finish',
                'ejyy_ask_for_leave_flow.applicant_assign',
                'ejyy_ask_for_leave_flow.relation_user_id',
                'ejyy_ask_for_leave_flow.refuse_reason',
                'ejyy_ask_for_leave_flow.finished_at',
                'ejyy_workflow_node.type',
                'ejyy_workflow_node.category',
                'ejyy_workflow_node.value',
                'ejyy_workflow_node.opt',
                'ejyy_workflow_node.opt_first_equal',
                'ejyy_workflow_node.opt_second_equal',
                'ejyy_property_company_user.real_name as relation_user_name'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                steps: steps.map(step => {
                    return {
                        ...step,
                        value: JSON.parse(step.value)
                    };
                })
            }
        };
    }
};

export default PcLeaveDetailAction;
