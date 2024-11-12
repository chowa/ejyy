/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    lng: number;
    lat: number;
    distance: number;
}

const PcSignSettingCreateAction = <Action>{
    router: {
        path: '/sign_setting/create',
        method: 'post',
        authRequired: true,
        roles: [],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
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
            },
            {
                name: 'distance',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, distance, lng, lat } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', TRUE)
            .update('latest', FALSE);

        await ctx.model.from('ejyy_employee_sign_setting').insert({
            community_id,
            lng,
            lat,
            distance,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcSignSettingCreateAction;
