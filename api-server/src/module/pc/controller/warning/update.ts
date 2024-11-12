/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, WARNING_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
    sign: string;
    secret: string;
    name: string;
    lng: number;
    lat: number;
}

const PcWarningUpdateAction = <Action>{
    router: {
        path: '/warning/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHYJ],
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
                name: 'sign',
                max: 32,
                required: true
            },
            {
                name: 'secret',
                max: 128,
                required: true
            },
            {
                name: 'name',
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
        const { id, community_id, sign, secret, name, lng, lat } = <RequestBody>ctx.request.body;

        const record = await ctx.model
            .from('ejyy_iot_warning')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法预警中控配置'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_warning')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: WARNING_NAME_EXIST,
                message: '中控名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_iot_warning')
            .update({
                sign,
                secret,
                name,
                lng,
                lat
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '修改预警中控配置成功'
        };
    }
};

export default PcWarningUpdateAction;
