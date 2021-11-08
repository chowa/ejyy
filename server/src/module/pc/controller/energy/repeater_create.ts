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
import { SUCCESS, REPEATER_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { REPEATER_XUAN_KUN, REPEATER_YOU_REN } from '~/constant/iot';

interface RequestBody {
    community_id: number;
    name: string;
    sign: string;
    category: typeof REPEATER_YOU_REN | typeof REPEATER_XUAN_KUN;
    username: string;
    password: string;
    lng: number;
    lat: number;
}

const PcEnergyRepeaterCreateAction = <Action>{
    router: {
        path: '/energy/repeater_create',
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
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'sign',
                max: 32,
                required: true
            },
            {
                name: 'category',
                regex: /^1|2$/,
                required: true
            },
            {
                name: 'username',
                max: 56,
                required: true
            },
            {
                name: 'password',
                max: 56,
                required: true
            },
            {
                name: 'lng',
                required: true,
                regex: /^\d+(\.\d+)?$/
            },
            {
                name: 'lat',
                required: true,
                regex: /^\d+(\.\d+)?$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, sign, name, category, username, password, lng, lat } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_iot_meter_repeater')
            .where('name', name)
            .andWhere('community_id', community_id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: REPEATER_NAME_EXIST,
                message: '中继器名称已存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_iot_meter_repeater').insert({
            community_id,
            sign,
            name,
            category,
            username,
            password,
            lng,
            lat,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcEnergyRepeaterCreateAction;
