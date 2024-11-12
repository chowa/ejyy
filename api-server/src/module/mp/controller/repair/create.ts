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
import { TRUE, FALSE } from '~/constant/status';
import {
    WATER_AND_HEATING,
    ELECTRICITY,
    DOOR_AND_WINDOW,
    PUBLIC_FACILITY,
    SUBMIT_REPAIR_STEP
} from '~/constant/repair';
import * as repairService from '~/service/repair';

interface RequestBody {
    dispose_subscribed: typeof TRUE | typeof FALSE;
    confrim_subscribed: typeof TRUE | typeof FALSE;
    finish_subscribed: typeof TRUE | typeof FALSE;
    repair_type: typeof WATER_AND_HEATING | typeof ELECTRICITY | typeof DOOR_AND_WINDOW | typeof PUBLIC_FACILITY;
    building_id: number;
    community_id: number;
    description: string;
    repair_imgs: string[];
}

const MpRepairCreateAction = <Action>{
    router: {
        path: '/repair/create',
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
                name: 'repair_type',
                required: true,
                regex: /^1|2|3|4$/
            },
            {
                name: 'building_id',
                required: true,
                regex: /^\d+$/
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
                name: 'repair_imgs',
                validator: val =>
                    Array.isArray(val) && val.every(item => /^\/repair\/[a-z0-9]{32}\.(jpg|jpeg|png)$/.test(item))
            }
        ]
    },
    response: async ctx => {
        const {
            dispose_subscribed,
            confrim_subscribed,
            finish_subscribed,
            repair_type,
            building_id,
            description,
            repair_imgs,
            community_id
        } = <RequestBody>ctx.request.body;

        const [id] = await ctx.model.from('ejyy_repair').insert({
            wechat_mp_user_id: ctx.mpUserInfo.id,
            community_id,
            dispose_subscribed,
            confrim_subscribed,
            finish_subscribed,
            repair_type,
            building_id,
            description,
            repair_imgs: repair_imgs ? repair_imgs.join('#') : null,
            step: SUBMIT_REPAIR_STEP,
            created_at: Date.now()
        });

        repairService.noticePropertyCompany(ctx.model, id);

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default MpRepairCreateAction;
