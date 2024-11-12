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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { UNBINDING_CAR, TRUE } from '~/constant/status';
import { OPEARTE_BY_SELF } from '~/constant/operate_type';

interface RequestParams {
    id: number;
}

const MpCarUnbindingAction = <Action>{
    router: {
        path: '/car/unbinding/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const affect = await ctx.model
            .table('ejyy_user_car')
            .update('status', UNBINDING_CAR)
            .where('id', id);

        if (affect === 0) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '解绑车辆信息失败'
            });
        }

        await ctx.model.from('ejyy_user_car_sync').insert({
            user_car_id: id,
            is_remove: TRUE
        });

        await ctx.model.from('ejyy_user_car_operate_log').insert({
            user_car_id: id,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            status: UNBINDING_CAR,
            operate_by: OPEARTE_BY_SELF,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default MpCarUnbindingAction;
