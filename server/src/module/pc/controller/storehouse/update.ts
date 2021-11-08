/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, MATERIAL_CATEGORY_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
    name: string;
    local: string;
}

const PcStorehouseUpdateAction = <Action>{
    router: {
        path: '/storehouse/update',
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
            },
            {
                name: 'name',
                max: 12,
                required: true
            },
            {
                name: 'local',
                max: 56,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, name, local, community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_storehouse')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        const repeat = await ctx.model
            .from('ejyy_storehouse')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MATERIAL_CATEGORY_EXIST,
                message: '仓库已存在'
            });
        }

        await ctx.model
            .from('ejyy_storehouse')
            .update({ name, local })
            .where('id', id)
            .andWhere('community_id', community_id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcStorehouseUpdateAction;
