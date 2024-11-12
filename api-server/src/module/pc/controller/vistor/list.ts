/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
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
    page_num: number;
    page_size: number;
    community_id: number;
    used?: boolean;
}

const PcVistorListAction = <Action>{
    router: {
        path: '/vistor/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FKTX],
        verifyCommunity: true
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
                name: 'used',
                regex: /^true|false$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, used } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_vistor')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_vistor.building_id')
            .where('ejyy_vistor.community_id', community_id)
            .andWhere(function() {
                if (typeof used === 'boolean') {
                    if (used) {
                        this.whereNotNull('ejyy_vistor.used_at');
                    } else {
                        this.whereNull('ejyy_vistor.used_at');
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_vistor.id'))
            .select(
                'ejyy_vistor.id',
                'ejyy_vistor.vistor_name',
                'ejyy_vistor.have_vistor_info',
                'ejyy_vistor.used_at',
                'ejyy_vistor.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .select(ctx.model.raw('IF(ejyy_vistor.property_company_user_id, 1, 0) as check_in'))
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_vistor.id', 'desc');

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

export default PcVistorListAction;
