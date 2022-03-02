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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE, TRUE } from '~/constant/status';
import { WORKFLOW_NODE_NOTICE } from '~/constant/workflow';

interface RequestBody {
    page_num: number;
    page_size: number;
    success?: typeof FALSE | typeof TRUE;
    community_id: number;
}

const PcPurchaseNoticeAction = <Action>{
    router: {
        path: '/purchase/notice',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'success',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, success } = <RequestBody>ctx.request.body;
        const where = {};

        if (success !== undefined) {
            where['success'] = success;
        }

        const list = await ctx.model
            .from('ejyy_material_purchase')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_material_purchase.created_by'
            )
            .andWhere('ejyy_material_purchase.community_id', community_id)
            .andWhere(where)
            .whereIn('ejyy_material_purchase.id', function() {
                this.from('ejyy_material_purchase_flow')
                    .where('node_type', WORKFLOW_NODE_NOTICE)
                    .andWhere('relation_user_id', ctx.pcUserInfo.id)
                    .select('parent_id');
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_material_purchase.id'))
            .select(
                'ejyy_material_purchase.id',
                'ejyy_material_purchase.created_by',
                'ejyy_property_company_user.real_name',
                'ejyy_material_purchase.remark',
                'ejyy_material_purchase.total',
                'ejyy_material_purchase.success',
                'ejyy_material_purchase.cancel',
                'ejyy_material_purchase.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_material_purchase.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcPurchaseNoticeAction;
