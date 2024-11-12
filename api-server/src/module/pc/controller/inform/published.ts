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
import { SUCCESS, STATUS_ERROR, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcInformPublishedAction = <Action>{
    router: {
        path: '/inform/published',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XZTZ],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_inform')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取行政通知'
            });
        }

        if (exist.published === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '行政通知已发布'
            });
        }

        const published_at = Date.now();

        await ctx.model
            .from('ejyy_inform')
            .update({
                published: TRUE,
                published_at,
                published_by: ctx.pcUserInfo.id
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            data: {
                published_at
            }
        };
    }
};

export default PcInformPublishedAction;
