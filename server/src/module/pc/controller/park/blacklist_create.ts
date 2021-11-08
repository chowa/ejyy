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
import { SUCCESS, QUERY_ILLEFAL, PARK_BLACKLIST_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    park_id: number;
    community_id: number;
    car_number: string;
}

const PcParkBlacklistCreateAction = <Action>{
    router: {
        path: '/park/blacklist_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHTC],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'park_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'car_number',
                required: true,
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, park_id, car_number } = <RequestBody>ctx.request.body;

        const parkInfo = await ctx.model
            .from('ejyy_iot_park')
            .where('id', park_id)
            .andWhere('community_id', community_id)
            .first();

        if (!parkInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的停车场'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_park_blacklist')
            .where('park_id', park_id)
            .andWhere('car_number', car_number)
            .first();

        if (exist) {
            return (ctx.body = {
                code: PARK_BLACKLIST_EXIST,
                message: '车牌已经录入黑名单'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_iot_park_blacklist').insert({
            park_id,
            car_number,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at,
                park: parkInfo.name
            }
        };
    }
};

export default PcParkBlacklistCreateAction;
