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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcStorehouseDeleteAction = <Action>{
    router: {
        path: '/storehouse/delete',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WLCC],
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

        const exist = await ctx.model
            .from('ejyy_storehouse')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        const used = await ctx.model
            .from('ejyy_material')
            .where('storehouse_id', id)
            .andWhere('community_id', community_id)
            .first();

        if (used) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '仓库使用中，不能删除'
            });
        }

        await ctx.model
            .from('ejyy_storehouse')
            .where('id', id)
            .andWhere('community_id', community_id)
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcStorehouseDeleteAction;
