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
import { SUCCESS, QUERY_ILLEFAL, MATERIAL_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { MATERIAL_ORIGIN_INIT } from '~/constant/material';
import { TRUE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    name: string;
    total: number;
    category_id: number;
    storehouse_id: number;
}

const PcMaterialCreateAction = <Action>{
    router: {
        path: '/material/create',
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
                name: 'total',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { name, category_id, storehouse_id, total, community_id } = <RequestBody>ctx.request.body;

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
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MATERIAL_EXIST,
                message: '物品名称已存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_material').insert({
            name,
            category_id,
            storehouse_id,
            total,
            community_id,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        await ctx.model.from('ejyy_material_purchase_item').insert({
            material_id: id,
            total,
            origin: MATERIAL_ORIGIN_INIT,
            finish: TRUE,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcMaterialCreateAction;
