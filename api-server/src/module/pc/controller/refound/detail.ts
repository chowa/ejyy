/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
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

const PcRefoundDetailAction = <Action>{
    router: {
        path: '/refound/detail',
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
            .from('ejyy_refound')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_refound.created_by')
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .where('ejyy_refound.id', id)
            .andWhere('ejyy_refound.community_id', community_id)
            .select(
                'ejyy_refound.id',
                'ejyy_refound.created_by',
                'ejyy_refound.begin_date',
                'ejyy_refound.finish_date',
                'ejyy_refound.reason',
                'ejyy_refound.total',
                'ejyy_refound.step',
                'ejyy_refound.success',
                'ejyy_refound.cancel',
                'ejyy_refound.canceled_at',
                'ejyy_refound.created_at',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_department.name as department_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取报销详细'
            });
        }

        const steps = await ctx.model
            .from('ejyy_refound_flow')
            .leftJoin('ejyy_workflow_node', 'ejyy_workflow_node.id', 'ejyy_refound_flow.workflow_node_id')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_refound_flow.relation_user_id'
            )
            .where('ejyy_refound_flow.parent_id', id)
            .select(
                'ejyy_refound_flow.id',
                'ejyy_refound_flow.step',
                'ejyy_refound_flow.finish',
                'ejyy_refound_flow.applicant_assign',
                'ejyy_refound_flow.relation_user_id',
                'ejyy_refound_flow.refuse_reason',
                'ejyy_refound_flow.finished_at',
                'ejyy_workflow_node.type',
                'ejyy_workflow_node.category',
                'ejyy_workflow_node.value',
                'ejyy_workflow_node.opt',
                'ejyy_workflow_node.opt_first_equal',
                'ejyy_workflow_node.opt_second_equal',
                'ejyy_property_company_user.real_name as relation_user_name'
            );

        const items = await ctx.model
            .from('ejyy_refound_item')
            .where('refound_id', id)
            .select('*');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                steps: steps.map(step => {
                    return {
                        ...step,
                        value: JSON.parse(step.value)
                    };
                }),
                items
            }
        };
    }
};

export default PcRefoundDetailAction;
