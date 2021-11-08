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
import { SUCCESS, QUERY_ILLEFAL, PARK_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
    sign: string;
    secret: string;
    name: string;
    verify_property_fee: typeof TRUE | typeof FALSE;
    lng: number;
    lat: number;
}

const PcParkUpdateAction = <Action>{
    router: {
        path: '/park/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHTC],
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
                name: 'verify_property_fee',
                regex: /^1|0$/,
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
        const { id, community_id, sign, secret, name, verify_property_fee, lng, lat } = <RequestBody>ctx.request.body;

        const record = await ctx.model
            .from('ejyy_iot_park')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改停车场配置'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_park')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: PARK_NAME_EXIST,
                message: ' 停车场名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_iot_park')
            .update({
                sign,
                secret,
                name,
                verify_property_fee,
                lng,
                lat
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '修改停车场配置成功'
        };
    }
};

export default PcParkUpdateAction;
