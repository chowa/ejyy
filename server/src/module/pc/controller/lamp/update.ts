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
import { SUCCESS, QUERY_ILLEFAL, LAMP_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
    secret: string;
    name: string;
    sn: string;
    port_total: number;
}

const PcLampUpdateAction = <Action>{
    router: {
        path: '/lamp/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHZM],
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
        const { id, community_id, secret, name, sn, port_total } = <RequestBody>ctx.request.body;
        const record = await ctx.model
            .from('ejyy_iot_lamp')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改灯控配置'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_lamp')
            .where('community_id', community_id)
            .andWhere('name', name)
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: LAMP_NAME_EXIST,
                message: '灯控名称重复'
            });
        }

        await ctx.model
            .from('ejyy_iot_lamp')
            .update({
                secret,
                name,
                sn,
                port_total
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '修改灯控成功'
        };
    }
};

export default PcLampUpdateAction;
