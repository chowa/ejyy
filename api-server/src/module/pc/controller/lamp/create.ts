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
import { SUCCESS, LAMP_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    secret: string;
    name: string;
    sn: string;
    port_total: number;
}

const PcLampCreateAction = <Action>{
    router: {
        path: '/lamp/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHZM],
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
                name: 'sn',
                max: 56,
                required: true
            },
            {
                name: 'port_total',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, secret, name, sn, port_total } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_iot_lamp')
            .where('community_id', community_id)
            .andWhere('name', name)
            .first();

        if (exist) {
            return (ctx.body = {
                code: LAMP_NAME_EXIST,
                message: '灯控名称重复'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_iot_lamp').insert({
            community_id,
            secret,
            name,
            sn,
            port_total,
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

export default PcLampCreateAction;
