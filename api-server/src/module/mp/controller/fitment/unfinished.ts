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
import { PROPERTY_COMPANY_CONFIRM_STEP } from '~/constant/fitment';

interface RequestBody {
    community_id: number;
}

const MpFitmentUnfinishedAction = <Action>{
    router: {
        path: '/fitment/unfinished',
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
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_fitment')
            .where('community_id', community_id)
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhereNot('step', PROPERTY_COMPANY_CONFIRM_STEP)
            .select('building_id');

        ctx.body = {
            code: SUCCESS,
            data: {
                list: list.map(item => item.building_id)
            }
        };
    }
};

export default MpFitmentUnfinishedAction;
