/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcOwerDetailAction = <Action>{
    router: {
        path: '/ower/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
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
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_wechat_mp_user')
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_wechat_mp_user.union_id'
            )
            .where('ejyy_wechat_mp_user.id', id)
            .select(
                'ejyy_wechat_mp_user.id',
                'ejyy_wechat_mp_user.nick_name',
                'ejyy_wechat_mp_user.real_name',
                'ejyy_wechat_mp_user.idcard',
                'ejyy_wechat_mp_user.phone',
                'ejyy_wechat_mp_user.avatar_url',
                'ejyy_wechat_mp_user.signature',
                'ejyy_wechat_mp_user.gender',
                'ejyy_wechat_mp_user.intact',
                'ejyy_wechat_mp_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取用户信息'
            });
        }

        const buildings = await ctx.model
            .from('ejyy_building_info')
            .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
            .where('ejyy_building_info.community_id', community_id)
            .andWhere('ejyy_user_building.wechat_mp_user_id', id)
            .select(
                'ejyy_user_building.id',
                'ejyy_user_building.building_id',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_building_info.construction_area',
                'ejyy_building_info.created_at',
                'ejyy_user_building.authenticated',
                'ejyy_user_building.authenticated_type',
                'ejyy_user_building.status'
            );

        if (buildings.length === 0) {
            const existApply = await ctx.model
                .from('ejyy_ower_apply')
                .where('community_id', community_id)
                .andWhere('wechat_mp_user_id', id)
                .andWhere('success', FALSE)
                .first();

            if (!existApply) {
                return (ctx.body = {
                    code: QUERY_ILLEFAL,
                    message: '非法获取用户信息'
                });
            }
        }

        const cars = await ctx.model
            .from('ejyy_user_car')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_car.building_id')
            .where('wechat_mp_user_id', id)
            .whereIn(
                'ejyy_user_car.building_id',
                buildings.map(record => record.building_id)
            )
            .select(
                'ejyy_user_car.id',
                'ejyy_user_car.car_number',
                'ejyy_user_car.status',
                'ejyy_user_car.building_id',
                'ejyy_user_car.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            );

        await ctx.model.from('ejyy_ower_detail_log').insert({
            wechat_mp_user_id: id,
            property_company_user_id: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                buildings,
                cars
            }
        };
    }
};

export default PcOwerDetailAction;
