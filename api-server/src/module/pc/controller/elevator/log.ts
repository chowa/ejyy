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
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcElevatorLogAction = <Action>{
    router: {
        path: '/elevator/log',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_iot_elevator_log')
            .leftJoin('ejyy_iot_elevator', 'ejyy_iot_elevator.id', 'ejyy_iot_elevator_log.elevator_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_iot_elevator_log.wechat_mp_user_id')
            .leftJoin('ejyy_vistor', 'ejyy_vistor.id', 'ejyy_iot_elevator_log.vistor_id')
            .where('ejyy_iot_elevator.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_iot_elevator_log.id'))
            .select(
                'ejyy_iot_elevator_log.id',
                'ejyy_iot_elevator_log.method',
                'ejyy_iot_elevator_log.created_at',
                'ejyy_iot_elevator_log.wechat_mp_user_id as owner_id',
                'ejyy_wechat_mp_user.real_name as owner_real_name',
                'ejyy_iot_elevator_log.vistor_id',
                'ejyy_vistor.vistor_name',
                'ejyy_iot_elevator.name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_iot_elevator_log.id', 'desc');

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

export default PcElevatorLogAction;
