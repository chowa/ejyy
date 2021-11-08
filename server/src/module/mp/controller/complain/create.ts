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
import { SUCCESS } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import {
    COMPLAIN,
    SUGGEST,
    COMPLAIN_HEALTH,
    COMPLAIN_NOISE,
    COMPLAIN_SERVICE,
    COMPLAIN_BUILDING,
    COMPLAIN_FIRE_ACCESS,
    COMPLAIN_COMMUNITY_FACILITY,
    COMPLAIN_OTHER,
    SUBMIT_COMPLAIN_STEP
} from '~/constant/complain';
import * as complainService from '~/service/complain';

interface RequestBody {
    dispose_subscribed: typeof TRUE | typeof FALSE;
    confrim_subscribed: typeof TRUE | typeof FALSE;
    finish_subscribed: typeof TRUE | typeof FALSE;
    type: typeof COMPLAIN | typeof SUGGEST;
    category:
        | typeof COMPLAIN_HEALTH
        | typeof COMPLAIN_NOISE
        | typeof COMPLAIN_SERVICE
        | typeof COMPLAIN_BUILDING
        | typeof COMPLAIN_FIRE_ACCESS
        | typeof COMPLAIN_COMMUNITY_FACILITY
        | typeof COMPLAIN_OTHER;
    description: string;
    community_id: number;
    complain_imgs?: string[];
}

const MpComplainCreateAction = <Action>{
    router: {
        path: '/complain/create',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'dispose_subscribed',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'confrim_subscribed',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'finish_subscribed',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'type',
                required: true,
                regex: /^1|2$/
            },
            {
                name: 'category',
                required: true,
                regex: /^1|2|3|4|5|6|7$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'description',
                required: true,
                min: 5,
                max: 200
            },
            {
                name: 'complain_imgs',
                validator: val =>
                    Array.isArray(val) && val.every(item => /^\/complain\/[a-z0-9]{32}\.(jpg|jpeg|png)$/.test(item))
            }
        ]
    },
    response: async ctx => {
        const {
            dispose_subscribed,
            confrim_subscribed,
            finish_subscribed,
            type,
            category,
            community_id,
            description,
            complain_imgs
        } = <RequestBody>ctx.request.body;

        const [id] = await ctx.model.from('ejyy_complain').insert({
            wechat_mp_user_id: ctx.mpUserInfo.id,
            type,
            category,
            community_id,
            description,
            dispose_subscribed,
            confrim_subscribed,
            finish_subscribed,
            complain_imgs: complain_imgs.join('#'),
            step: SUBMIT_COMPLAIN_STEP,
            created_at: Date.now()
        });

        complainService.noticePropertyCompany(ctx.model, id);

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default MpComplainCreateAction;
