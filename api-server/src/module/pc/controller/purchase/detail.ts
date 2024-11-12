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

const PcPurchaseDetailAction = <Action>{
    router: {
        path: '/purchase/detail',
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
            .from('ejyy_material_purchase')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_material_purchase.created_by'
            )
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .where('ejyy_material_purchase.id', id)
            .andWhere('ejyy_material_purchase.community_id', community_id)
            .select(
                'ejyy_material_purchase.id',
                'ejyy_material_purchase.created_by',
                'ejyy_material_purchase.remark',
                'ejyy_material_purchase.total',
                'ejyy_material_purchase.step',
                'ejyy_material_purchase.success',
                'ejyy_material_purchase.cancel',
                'ejyy_material_purchase.canceled_at',
                'ejyy_material_purchase.created_at',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_department.name as department_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取采购详细'
            });
        }

        const steps = await ctx.model
            .from('ejyy_material_purchase_flow')
            .leftJoin('ejyy_workflow_node', 'ejyy_workflow_node.id', 'ejyy_material_purchase_flow.workflow_node_id')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_material_purchase_flow.relation_user_id'
            )
            .where('ejyy_material_purchase_flow.parent_id', id)
            .select(
                'ejyy_material_purchase_flow.id',
                'ejyy_material_purchase_flow.step',
                'ejyy_material_purchase_flow.finish',
                'ejyy_material_purchase_flow.applicant_assign',
                'ejyy_material_purchase_flow.relation_user_id',
                'ejyy_material_purchase_flow.refuse_reason',
                'ejyy_material_purchase_flow.finished_at',
                'ejyy_workflow_node.type',
                'ejyy_workflow_node.category',
                'ejyy_workflow_node.value',
                'ejyy_workflow_node.opt',
                'ejyy_workflow_node.opt_first_equal',
                'ejyy_workflow_node.opt_second_equal',
                'ejyy_property_company_user.real_name as relation_user_name'
            );

        const items = await ctx.model
            .from('ejyy_material_purchase_item')
            .leftJoin('ejyy_material', 'ejyy_material.id', 'ejyy_material_purchase_item.material_id')
            .leftJoin('ejyy_material_supplier', 'ejyy_material_supplier.id', 'ejyy_material_purchase_item.supplier_id')
            .where('ejyy_material_purchase_item.task_id', id)
            .select(
                'ejyy_material_purchase_item.total',
                'ejyy_material_purchase_item.fee',
                'ejyy_material_purchase_item.material_id',
                'ejyy_material_purchase_item.supplier_id',
                'ejyy_material_purchase_item.finish',
                'ejyy_material.name as material',
                'ejyy_material_supplier.title as supplier',
                'ejyy_material_supplier.linkman',
                'ejyy_material_supplier.phone',
                'ejyy_material_supplier.bank_name',
                'ejyy_material_supplier.bank_id',
                'ejyy_material_supplier.bank_address'
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
                }),
                items
            }
        };
    }
};

export default PcPurchaseDetailAction;
