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
import { SUCCESS, FITMENT_CREATE_FAIL } from '~/constant/code';
import { USER_SUBMIT_APPLY_STEP } from '~/constant/fitment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    building_id: number;
    wechat_mp_user_id: number;
}

const PcFitmentCreateAction = <Action>{
    router: {
        path: '/fitment/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZXDJ],
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
                name: 'building_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'wechat_mp_user_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, building_id, wechat_mp_user_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_fitment')
            .where('community_id', community_id)
            .andWhere('building_id', building_id)
            .whereNull('finished_at')
            .first();

        if (exist) {
            return (ctx.body = {
                code: FITMENT_CREATE_FAIL,
                message: '已有业主提交装修报备，请勿重复提交'
            });
        }

        const [id] = await ctx.model.from('ejyy_fitment').insert({
            community_id,
            building_id,
            step: USER_SUBMIT_APPLY_STEP,
            wechat_mp_user_id,
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

export default PcFitmentCreateAction;
