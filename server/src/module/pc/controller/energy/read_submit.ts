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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';

interface RequestBody {
    meter_id: number;
    community_id: number;
    value: number;
}

const PcEnergyReadSubmitAction = <Action>{
    router: {
        path: '/energy/read_submit',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'meter_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'value',
                regex: /^\d+(\.\d+)?$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, value, meter_id } = <RequestBody>ctx.request.body;

        const meterInfo = await ctx.model
            .from('ejyy_iot_meter')
            .where('community_id', community_id)
            .andWhere('id', meter_id)
            .first();

        if (!meterInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的仪表信息'
            });
        }

        const lastInfo = await ctx.model
            .from('ejyy_iot_meter_read')
            .where('meter_id', meter_id)
            .orderBy('id', 'desc')
            .first();

        const created_at = Date.now();
        const last_value = lastInfo ? lastInfo.current_value : meterInfo.current_value;

        if (value < last_value) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '当前读数不可小于历史读数'
            });
        }

        const [id] = await ctx.model.from('ejyy_iot_meter_read').insert({
            meter_id,
            from_repeater: FALSE,
            last_value,
            current_value: value,
            created_at,
            created_by: ctx.pcUserInfo.id
        });

        await ctx.model
            .from('ejyy_iot_meter')
            .update('current_value', value)
            .where('id', meter_id);

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at,
                last_value
            }
        };
    }
};

export default PcEnergyReadSubmitAction;
