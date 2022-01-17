/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const StatisticIotAction = <Action>{
    router: {
        path: '/statistic/iot',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const entrance = await ctx.model
            .from('ejyy_iot_entrance')
            .where('community_id', community_id)
            .select('name', 'online');

        const elevator = await ctx.model
            .from('ejyy_iot_elevator')
            .where('community_id', community_id)
            .select('name', 'online');

        const lamp = await ctx.model
            .from('ejyy_iot_lamp')
            .leftJoin('ejyy_iot_lamp_line', 'ejyy_iot_lamp_line.lamp_id', 'ejyy_iot_lamp.id')
            .where('ejyy_iot_lamp.community_id', community_id)
            .select(
                'ejyy_iot_lamp.id',
                'ejyy_iot_lamp.name',
                'ejyy_iot_lamp.online',
                'ejyy_iot_lamp_line.name as line'
            );

        const lmap = {};

        lamp.forEach(record => {
            if (!(record.id in lmap)) {
                lmap[record.id] = {
                    name: record.name,
                    online: record.online,
                    line: []
                };
            }

            if (record.line) {
                lmap[record.id].line.push(record.line);
            }
        });

        const repeater = await ctx.model
            .from('ejyy_iot_meter_repeater')
            .where('community_id', community_id)
            .select('name', 'online');

        const park = await ctx.model
            .from('ejyy_iot_park')
            .where('community_id', community_id)
            .select('name', 'online');

        const warning = await ctx.model
            .from('ejyy_iot_warning')
            .where('community_id', community_id)
            .select('name', 'online');

        ctx.body = {
            code: SUCCESS,
            data: {
                entrance,
                elevator,
                lamp: Object.values(lmap),
                repeater,
                park,
                warning
            }
        };
    }
};

export default StatisticIotAction;
