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
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    type?: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE | typeof MERCHANT | typeof GARAGE;
}

const PcBuildingListAction = <Action>{
    router: {
        path: '/building/list',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
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
                name: 'type',
                regex: /^1|2|3|4|5$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, type } = <RequestBody>ctx.request.body;
        const where = {};

        if (type !== undefined) {
            where['type'] = type;
        }

        const list = await ctx.model
            .from('ejyy_building_info')
            .where('community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'type', 'area', 'building', 'unit', 'number', 'created_at')
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

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

export default PcBuildingListAction;
