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
import {
    WATER_AND_HEATING,
    ELECTRICITY,
    DOOR_AND_WINDOW,
    PUBLIC_FACILITY,
    SUBMIT_REPAIR_STEP
} from '~/constant/repair';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    wechat_mp_user_id?: number;
    repair_type: typeof WATER_AND_HEATING | typeof ELECTRICITY | typeof DOOR_AND_WINDOW | typeof PUBLIC_FACILITY;
    building_id: number;
    community_id: number;
    description: string;
    repair_imgs: string[];
}

const PcRepairCreateAction = <Action>{
    router: {
        path: '/repair/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WXWF],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'wechat_mp_user_id',
                regex: /^\d+$/
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
                validator: val => Array.isArray(val) && val.every(item => /^\/repair\/[a-z0-9]{32}\.(jpg|jpeg|png)$/)
            }
        ]
    },
    response: async ctx => {
        const { repair_type, building_id, description, repair_imgs, community_id, wechat_mp_user_id } = <RequestBody>(
            ctx.request.body
        );

        const [id] = await ctx.model.from('ejyy_repair').insert({
            property_company_user_id: wechat_mp_user_id ? null : ctx.pcUserInfo.id,
            wechat_mp_user_id: wechat_mp_user_id ? wechat_mp_user_id : null,
            community_id,
            repair_type,
            building_id,
            description,
            repair_imgs: repair_imgs ? repair_imgs.join('#') : null,
            step: SUBMIT_REPAIR_STEP,
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

export default PcRepairCreateAction;
