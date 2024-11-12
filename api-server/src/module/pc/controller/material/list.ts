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
    community_id: number;
    page_num: number;
    page_size: number;
    category_id?: number;
    storehouse_id?: number;
}

const PcMaterialListAction = <Action>{
    router: {
        path: '/material/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
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
            },
            {
                name: 'category_id',
                regex: /^\d+$/
            },
            {
                name: 'storehouse_id',
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, storehouse_id, category_id, community_id } = <RequestBody>ctx.request.body;
        const where = {};

        if (storehouse_id) {
            where['ejyy_material.storehouse_id'] = storehouse_id;
        }

        if (category_id) {
            where['ejyy_material.category_id'] = category_id;
        }

        const list = await ctx.model
            .from('ejyy_material')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_material.created_by')
            .leftJoin('ejyy_material_category', 'ejyy_material_category.id', 'ejyy_material.category_id')
            .leftJoin('ejyy_storehouse', 'ejyy_storehouse.id', 'ejyy_material.storehouse_id')
            .where('ejyy_material.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_material.id'))
            .select(
                'ejyy_material.id',
                'ejyy_material.name',
                'ejyy_material.total',
                'ejyy_material.category_id',
                'ejyy_material.storehouse_id',
                'ejyy_material.created_at',
                'ejyy_material.created_by',
                'ejyy_property_company_user.real_name',
                'ejyy_material_category.name as category',
                'ejyy_storehouse.name as storehouse',
                'ejyy_storehouse.local'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_material.id', 'desc');

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

export default PcMaterialListAction;
