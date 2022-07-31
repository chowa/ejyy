/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMoveCarDetailAction = <Action>{
    router: {
        path: '/move_car/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQNC],
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
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_move_car')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_move_car.wechat_mp_user_id')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_move_car.response_user_id')
            .select(
                'ejyy_move_car.id',
                'ejyy_move_car.car_number',
                'ejyy_move_car.move_reason',
                'ejyy_move_car.live_img',
                'ejyy_move_car.subscribed',
                'ejyy_move_car.have_concat_info',
                'ejyy_move_car.response_user_id',
                'ejyy_move_car.response_content',
                'ejyy_move_car.responsed_at',
                'ejyy_move_car.created_at',
                'ejyy_wechat_mp_user.real_name as wechat_mp_user_real_name',
                'ejyy_wechat_mp_user.id as wechat_mp_user_id',
                'ejyy_property_company_user.real_name as property_company_user_real_name',
                'ejyy_property_company_user.id as property_company_user_id'
            )
            .where('ejyy_move_car.id', id)
            .where('ejyy_move_car.community_id', community_id)
            .first();

        let concatList = [];

        if (info.have_concat_info) {
            concatList = await ctx.model
                .from('ejyy_user_car')
                .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_user_car.wechat_mp_user_id')
                .where('ejyy_user_car.car_number', info.car_number)
                .select('ejyy_wechat_mp_user.phone', 'ejyy_user_car.car_number');
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                concatList
            }
        };
    }
};

export default PcMoveCarDetailAction;
