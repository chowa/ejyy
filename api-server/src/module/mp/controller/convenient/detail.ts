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

interface RequestParams {
    community_id: number;
}

const MpConvenientDetailAction = <Action>{
    router: {
        path: '/convenient/detail/:community_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestParams>ctx.params;

        const list = await ctx.model
            .from('ejyy_convenient')
            .where('community_id', community_id)
            .select('title', 'location', 'phone')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpConvenientDetailAction;
