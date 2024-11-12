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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    material_id: number;
    page_num: number;
    page_size: number;
}

const PcMaterialUsedction = <Action>{
    router: {
        path: '/material/used',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'material_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, material_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_material_used')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_material_used.used_by')
            .where('ejyy_material_used.material_id', material_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_material_used.id'))
            .select(
                'ejyy_material_used.id',
                'ejyy_material_used.total',
                'ejyy_material_used.reason',
                'ejyy_material_used.created_at',
                'ejyy_material_used.used_by',
                'ejyy_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_material_used.id', 'desc');

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

export default PcMaterialUsedction;
