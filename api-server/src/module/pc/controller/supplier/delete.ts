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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}

const PcSupplierDeleteAction = <Action>{
    router: {
        path: '/supplier/delete/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.WLCC]
    },
    validator: {
        params: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const exist = await ctx.model
            .from('ejyy_material_supplier')
            .where('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        await ctx.model
            .from('ejyy_material_supplier')
            .where('id', id)
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcSupplierDeleteAction;
