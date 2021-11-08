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
import { SUCCESS, QUERY_ILLEFAL, MATERIAL_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    name: string;
    id: number;
    category_id: number;
    storehouse_id: number;
}

const PcMaterialUpdateAction = <Action>{
    router: {
        path: '/material/update',
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
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'category_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'storehouse_id',
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
        const { name, category_id, storehouse_id, id, community_id } = <RequestBody>ctx.request.body;

        const categoryExist = await ctx.model
            .from('ejyy_material_category')
            .where('id', category_id)
            .first();

        if (!categoryExist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '参数非法'
            });
        }

        const storehouseExist = await ctx.model
            .from('ejyy_storehouse')
            .where('id', storehouse_id)
            .andWhere('community_id', community_id)
            .first();

        if (!storehouseExist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '参数非法'
            });
        }

        const repeat = await ctx.model
            .from('ejyy_material')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MATERIAL_EXIST,
                message: '物品名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_material')
            .update({
                name,
                category_id,
                storehouse_id
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMaterialUpdateAction;
