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

interface RequestBody {
    community_id: number;
    id: number;
}

const PcConvenientDeleteAction = <Action>{
    router: {
        path: '/convenient/delete',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, id } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_convenient')
            .where({
                community_id,
                id
            })
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcConvenientDeleteAction;
