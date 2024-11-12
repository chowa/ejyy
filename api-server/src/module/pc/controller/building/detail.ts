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
import { CARPORT, GARAGE } from '~/constant/building';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcBuildingDetailAction = <Action>{
    router: {
        path: '/building/detail',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
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
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_building_info')
            .where('community_id', community_id)
            .andWhere('id', id)
            .select('id', 'type', 'area', 'building', 'unit', 'number', 'construction_area', 'created_at')
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的固定资产查询'
            });
        }

        const registered = await ctx.model
            .from('ejyy_property_company_building_registered')
            .where('building_id', id)
            .select('name', 'idcard', 'phone')
            .first();

        let owners = [];

        if (ctx.pcUserInfo.access.includes(ROLE.YZDA)) {
            owners = await ctx.model
                .from('ejyy_user_building')
                .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_user_building.wechat_mp_user_id')
                .where('ejyy_user_building.building_id', id)
                .select(
                    'ejyy_user_building.id',
                    'ejyy_wechat_mp_user.id as user_id',
                    'ejyy_wechat_mp_user.real_name',
                    'ejyy_user_building.status'
                );
        }

        let cars = [];

        if (ctx.pcUserInfo.access.includes(ROLE.CLGL) && (info.type === CARPORT || info.type === GARAGE)) {
            cars = await ctx.model
                .from('ejyy_user_car')
                .where('building_id', id)
                .select('id', 'car_number', 'car_type', 'status', 'created_at');
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                registered,
                owners,
                cars
            }
        };
    }
};

export default PcBuildingDetailAction;
