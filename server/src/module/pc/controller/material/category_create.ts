/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, MATERIAL_CATEGORY_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    name: string;
    description?: string;
}

const PcMaterialCategoryCreateAction = <Action>{
    router: {
        path: '/material/category_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WLCC]
    },
    validator: {
        body: [
            {
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'description',
                max: 128
            }
        ]
    },
    response: async ctx => {
        const { name, description } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_material_category')
            .where('name', name)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MATERIAL_CATEGORY_EXIST,
                message: '分类已经存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_material_category').insert({
            name,
            description: description ? description : null,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                created_at,
                id
            }
        };
    }
};

export default PcMaterialCategoryCreateAction;
