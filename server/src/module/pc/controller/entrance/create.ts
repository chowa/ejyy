/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, ENTRANCE_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { ENTRANCE_KAI_PA_SI } from '~/constant/iot';

interface RequestBody {
    community_id: number;
    sign: string;
    secret: string;
    name: string;
    building?: string;
    category: typeof ENTRANCE_KAI_PA_SI;
    lng: number;
    lat: number;
}

const PcEntranceCreateAction = <Action>{
    router: {
        path: '/entrance/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZNMJ],
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
        const { community_id, sign, secret, name, building, category, lng, lat } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_iot_entrance')
            .where('name', name)
            .andWhere('community_id', community_id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: ENTRANCE_NAME_EXIST,
                message: '门禁名称已存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_iot_entrance').insert({
            community_id,
            sign,
            secret,
            name,
            building,
            category,
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

export default PcEntranceCreateAction;
