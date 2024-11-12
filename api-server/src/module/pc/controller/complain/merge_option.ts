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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { SUBMIT_COMPLAIN_STEP } from '~/constant/complain';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcComplainMergeOptionAction = <Action>{
    router: {
        path: '/complain/merge_option',
        method: 'post',
        authRequired: true,
        roles: [ROLE.TSJY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_complain')
            .whereNull('merge_id')
            .andWhere('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', SUBMIT_COMPLAIN_STEP)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const list = await ctx.model
            .from('ejyy_complain')
            .whereNull('merge_id')
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .andWhere('created_at', '<=', detail.created_at + 1000 * 60 * 60 * 24)
            .andWhere('created_at', '>=', detail.created_at - 1000 * 60 * 60 * 24)
            .andWhereNot('step', SUBMIT_COMPLAIN_STEP)
            .select('id', 'description', 'type', 'category', 'step', 'created_at');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcComplainMergeOptionAction;
