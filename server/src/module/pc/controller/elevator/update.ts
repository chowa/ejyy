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
import { SUCCESS, QUERY_ILLEFAL, ELEVATOR_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { ENTRANCE_KAI_PA_SI } from '~/constant/iot';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
    sign: string;
    secret: string;
    name: string;
    building?: string;
    category: typeof ENTRANCE_KAI_PA_SI;
    verify_property_fee: typeof TRUE | typeof FALSE;
    lng: number;
    lat: number;
}

const PcElevatorUpdateAction = <Action>{
    router: {
        path: '/elevator/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZNTK],
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
                name: 'building',
                max: 32
            },
            {
                name: 'category',
                regex: /^1$/,
                required: true
            },
            {
                name: 'verify_property_fee',
                required: true,
                regex: /^0|1$/
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
        const { id, community_id, sign, secret, name, building, category, verify_property_fee, lng, lat } = <
            RequestBody
        >ctx.request.body;

        const record = await ctx.model
            .from('ejyy_iot_elevator')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改门禁'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_elevator')
            .where('community_id', community_id)
            .andWhere('name', name)
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: ELEVATOR_NAME_EXIST,
                message: '梯控名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_iot_elevator')
            .update({
                sign,
                secret,
                name,
                building,
                category,
                verify_property_fee,
                lng,
                lat
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '修改门禁成功'
        };
    }
};

export default PcElevatorUpdateAction;
