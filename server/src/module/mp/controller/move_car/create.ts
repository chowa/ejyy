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
import { SUCCESS, STATUS_ERROR } from '~/constant/code';
import { TRUE, FALSE, BINDING_CAR } from '~/constant/status';
import {
    MOVE_CAR_BECAUSE_OF_GO_THROUGH,
    MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS,
    MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE,
    MOVE_CAR_BECAUSE_OF_EFFECT_WORK,
    MOVE_CAR_BECAUSE_OF_OCCUPY_PORT
} from '~/constant/move_car';
import * as moveCarService from '~/service/move_car';

interface RequestBody {
    community_id: number;
    car_number: string;
    move_reason:
        | typeof MOVE_CAR_BECAUSE_OF_GO_THROUGH
        | typeof MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS
        | typeof MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE
        | typeof MOVE_CAR_BECAUSE_OF_EFFECT_WORK
        | typeof MOVE_CAR_BECAUSE_OF_OCCUPY_PORT;
    live_img: string;
    subscribed: typeof TRUE | typeof FALSE;
}

const MpMoveCarCreateAction = <Action>{
    router: {
        path: '/move_car/create',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'car_number',
                required: true,
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'move_reason',
                required: true,
                validator: val => {
                    return [
                        MOVE_CAR_BECAUSE_OF_GO_THROUGH,
                        MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS,
                        MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE,
                        MOVE_CAR_BECAUSE_OF_EFFECT_WORK,
                        MOVE_CAR_BECAUSE_OF_OCCUPY_PORT
                    ].includes(val);
                }
            },
            {
                name: 'live_img',
                max: 128,
                regex: /^\/move_car\/[a-z0-9]{32}\.(jpg|jpeg|png)$/,
                required: true
            },
            {
                name: 'subscribed',
                regex: /^0|1$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, car_number, move_reason, live_img, subscribed } = <RequestBody>ctx.request.body;

        const inDb = await ctx.model
            .from('ejyy_user_car')
            .where('car_number', car_number)
            .where('status', BINDING_CAR)
            .select('wechat_mp_user_id');

        if (inDb.some(({ wechat_mp_user_id }) => wechat_mp_user_id === ctx.mpUserInfo.id)) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '自己的车自己挪，别麻烦物业了'
            });
        }

        const have_concat_info = inDb.length > 0 ? TRUE : FALSE;

        const [id] = await ctx.model.from('ejyy_move_car').insert({
            community_id,
            car_number,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            have_concat_info,
            move_reason,
            live_img,
            subscribed,
            created_at: Date.now()
        });

        moveCarService.noticePropertyCompany(ctx.model, id);

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                have_concat_info
            }
        };
    }
};

export default MpMoveCarCreateAction;
