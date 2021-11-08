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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcCarHistoryAction = <Action>{
    router: {
        path: '/car/history',
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

        const list = await ctx.model
            .from('ejyy_user_car_operate_log')
            .leftJoin('ejyy_user_car', 'ejyy_user_car.id', 'ejyy_user_car_operate_log.user_car_id')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_car.building_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_user_car_operate_log.wechat_mp_user_id')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_user_car_operate_log.property_company_user_id'
            )
            .where('ejyy_user_car_operate_log.user_car_id', id)
            .andWhere('ejyy_building_info.community_id', community_id)
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
                list
            }
        };
    }
};

export default PcCarHistoryAction;
