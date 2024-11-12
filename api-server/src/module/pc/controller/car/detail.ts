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

const PcCarDetailAction = <Action>{
    router: {
        path: '/car/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CLGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_user_car')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_car.building_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_user_car.wechat_mp_user_id')
            .where('ejyy_building_info.community_id', community_id)
            .where('ejyy_user_car.id', id)
            .select(
                'ejyy_user_car.id',
                'ejyy_user_car.wechat_mp_user_id',
                'ejyy_wechat_mp_user.real_name',
                'ejyy_user_car.building_id',
                'ejyy_user_car.car_number',
                'ejyy_user_car.car_type',
                'ejyy_user_car.is_new_energy',
                'ejyy_user_car.status',
                'ejyy_user_car.sync',
                'ejyy_user_car.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取车辆信息'
            });
        }

        const operateList = await ctx.model
            .from('ejyy_user_car_operate_log')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_user_car_operate_log.wechat_mp_user_id')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_user_car_operate_log.property_company_user_id'
            )
            .where('ejyy_user_car_operate_log.user_car_id', id)
            .select(
                'ejyy_user_car_operate_log.status',
                'ejyy_user_car_operate_log.operate_by',
                'ejyy_user_car_operate_log.created_at',
                'ejyy_wechat_mp_user.id as ejyy_wechat_mp_user_id',
                'ejyy_wechat_mp_user.real_name as ejyy_wechat_mp_user_real_name',
                'ejyy_property_company_user.id as property_company_user_id',
                'ejyy_property_company_user.real_name as property_company_user_real_name'
            )
            .orderBy('ejyy_user_car_operate_log.id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                operateList
            }
        };
    }
};

export default PcCarDetailAction;
