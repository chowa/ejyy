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
import { BINDING_CAR } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpMoveCarSelfAction = <Action>{
    router: {
        path: '/move_car/self',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const myCars = await ctx.model
            .from('ejyy_user_car')
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .where('status', BINDING_CAR)
            .select('car_number');

        const list = await ctx.model
            .from('ejyy_move_car')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_move_car.community_id')
            .where(function() {
                myCars.forEach(({ car_number }) => {
                    this.orWhere('ejyy_move_car.car_number', car_number);
                });
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_move_car.id'))
            .select(
                'ejyy_community_info.name as community_name',
                'ejyy_move_car.car_number',
                'ejyy_move_car.move_reason',
                'ejyy_move_car.responsed_at',
                'ejyy_move_car.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_move_car.id', 'desc');

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

export default MpMoveCarSelfAction;
