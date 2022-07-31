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
import { SUCCESS } from '~/constant/code';
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
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    wechat_mp_user_id?: number;
    type: typeof COMPLAIN | typeof SUGGEST;
    category:
        | typeof COMPLAIN_HEALTH
        | typeof COMPLAIN_NOISE
        | typeof COMPLAIN_SERVICE
        | typeof COMPLAIN_BUILDING
        | typeof COMPLAIN_FIRE_ACCESS
        | typeof COMPLAIN_COMMUNITY_FACILITY
        | typeof COMPLAIN_OTHER;
    community_id: number;
    description: string;
    complain_imgs: string[];
}

const PcComplainCreateAction = <Action>{
    router: {
        path: '/complain/create',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.TSJY]
    },
    validator: {
        body: [
            {
                name: 'wechat_mp_user_id',
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                regex: /^\d+$/
            },
            {
                name: 'type',
                regex: /^1|2$/,
                required: true
            },
            {
                name: 'category',
                regex: /^1|2|3|4|5|6|7$/,
                required: true
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
        const { type, category, description, complain_imgs, community_id, wechat_mp_user_id } = <RequestBody>(
            ctx.request.body
        );

        const [id] = await ctx.model.from('ejyy_complain').insert({
            property_company_user_id: wechat_mp_user_id ? null : ctx.pcUserInfo.id,
            wechat_mp_user_id: wechat_mp_user_id ? wechat_mp_user_id : null,
            community_id,
            type,
            category,
            description,
            complain_imgs: complain_imgs ? complain_imgs.join('#') : null,
            step: SUBMIT_COMPLAIN_STEP,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcComplainCreateAction;
