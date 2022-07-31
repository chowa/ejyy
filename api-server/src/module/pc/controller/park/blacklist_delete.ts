/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, DATA_MODEL_REMOVE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
    park_id: number;
    car_number: string;
}

const PcParkBlacklistDeleteAction = <Action>{
    router: {
        path: '/park/blacklist_delete',
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
        const { id, community_id, park_id, car_number } = <RequestBody>ctx.request.body;

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

        const affect = await ctx.model
            .from('ejyy_iot_park_blacklist')
            .where('id', id)
            .where('park_id', park_id)
            .andWhere('car_number', car_number)
            .delete();

        if (affect == 0) {
            return (ctx.body = {
                code: DATA_MODEL_REMOVE_FAIL,
                message: '删除黑名单车辆失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '删除黑名单车辆成功'
        };
    }
};

export default PcParkBlacklistDeleteAction;
