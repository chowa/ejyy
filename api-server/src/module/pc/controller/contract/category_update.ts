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
import { SUCCESS, MODEL_FIELD_VALUE_EXIST, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    name: string;
    description?: string;
}

const PcContractCategoryUpdateAction = <Action>{
    router: {
        path: '/contract/category_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL]
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'name',
                required: true,
                max: 32
            },
            {
                name: 'description',
                max: 128
            }
        ]
    },
    response: async ctx => {
        const { id, name, description } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_contract_category')
            .where('name', name)
            .andWhere('id', '<>', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MODEL_FIELD_VALUE_EXIST,
                message: '合同类别名称已经存在'
            });
        }

        const affect = await ctx.model
            .from('ejyy_contract_category')
            .update({ name, description: description ? description : null })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '更新合同类别失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '更新合同类别成功'
        };
    }
};

export default PcContractCategoryUpdateAction;
