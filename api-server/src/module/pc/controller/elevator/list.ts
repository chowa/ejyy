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
}

const PcElevatorListAction = <Action>{
    router: {
        path: '/elevator/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZNTK],
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_iot_elevator')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_iot_elevator.created_by')
            .where('ejyy_iot_elevator.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_iot_elevator.id'))
            .select(
                'ejyy_iot_elevator.id',
                'ejyy_iot_elevator.community_id',
                'ejyy_iot_elevator.sign',
                'ejyy_iot_elevator.secret',
                'ejyy_iot_elevator.name',
                'ejyy_iot_elevator.building',
                'ejyy_iot_elevator.category',
                'ejyy_iot_elevator.online',
                'ejyy_iot_elevator.verify_property_fee',
                'ejyy_iot_elevator.lng',
                'ejyy_iot_elevator.lat',
                'ejyy_iot_elevator.created_by',
                'ejyy_iot_elevator.created_at',
                'ejyy_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_iot_elevator.id', 'desc');

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

export default PcElevatorListAction;
