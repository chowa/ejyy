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

const PcEnergyRepeaterAction = <Action>{
    router: {
        path: '/energy/repeater',
        method: 'post',
        authRequired: true,
        roles: [ROLE.NHGL],
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
            .from('ejyy_iot_meter_repeater')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_iot_meter_repeater.created_by'
            )
            .where('ejyy_iot_meter_repeater.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_iot_meter_repeater.id'))
            .select(
                'ejyy_iot_meter_repeater.id',
                'ejyy_iot_meter_repeater.community_id',
                'ejyy_iot_meter_repeater.sign',
                'ejyy_iot_meter_repeater.name',
                'ejyy_iot_meter_repeater.category',
                'ejyy_iot_meter_repeater.username',
                'ejyy_iot_meter_repeater.password',
                'ejyy_iot_meter_repeater.lng',
                'ejyy_iot_meter_repeater.lat',
                'ejyy_iot_meter_repeater.online',
                'ejyy_iot_meter_repeater.created_by',
                'ejyy_iot_meter_repeater.created_at',
                'ejyy_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_iot_meter_repeater.id', 'desc');

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

export default PcEnergyRepeaterAction;
