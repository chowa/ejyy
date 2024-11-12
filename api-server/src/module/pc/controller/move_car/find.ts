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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { BINDING_CAR } from '~/constant/status';

interface RequestBody {
    car_number: string;
    community_id: number;
}

const PcMoveCarFindAction = <Action>{
    router: {
        path: '/move_car/find',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQNC],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'car_number',
                required: true,
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { car_number } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_user_car')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_user_car.wechat_mp_user_id')
            .where('ejyy_user_car.car_number', car_number)
            .andWhere('ejyy_user_car.status', BINDING_CAR)
            .select('ejyy_wechat_mp_user.phone');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcMoveCarFindAction;
