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
import { SUCCESS, QUERY_ILLEFAL, REPEATER_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { REPEATER_XUAN_KUN, REPEATER_YOU_REN } from '~/constant/iot';

interface RequestBody {
    id: number;
    community_id: number;
    name: string;
    sign: string;
    category: typeof REPEATER_YOU_REN | typeof REPEATER_XUAN_KUN;
    username: string;
    password: string;
    lng: number;
    lat: number;
}

const PcEnergyRepeaterUpdateAction = <Action>{
    router: {
        path: '/energy/repeater_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.NHGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
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
                name: 'category',
                regex: /^1|2$/,
                required: true
            },
            {
                name: 'sign',
                max: 32,
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
        const { id, community_id, sign, name, category, username, password, lng, lat } = <RequestBody>ctx.request.body;

        const record = await ctx.model
            .from('ejyy_iot_meter_repeater')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改中继器'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_meter_repeater')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: REPEATER_NAME_EXIST,
                message: '中继器名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_iot_meter_repeater')
            .update({
                sign,
                name,
                category,
                username,
                password,
                lng,
                lat
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '修改中继器配置成功'
        };
    }
};

export default PcEnergyRepeaterUpdateAction;
