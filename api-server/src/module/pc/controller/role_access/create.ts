/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, MODEL_FIELD_VALUE_EXIST } from '~/constant/code';
import { Role } from '~/constant/role_access';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    content: typeof Role[];
    name: string;
}

const PcRoleAccessCreateAction = <Action>{
    router: {
        path: '/role_access/create',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'name',
                required: true,
                max: 12
            },
            {
                name: 'content',
                required: true,
                validator: val => Array.isArray(val) && val.every(id => Object.values(ROLE).includes(id))
            }
        ]
    },
    response: async ctx => {
        const { content, name } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_property_company_access')
            .where('name', name)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MODEL_FIELD_VALUE_EXIST,
                message: '权限名称已存在'
            });
        }

        const [id] = await ctx.model.from('ejyy_property_company_access').insert({
            name,
            content: JSON.stringify(content)
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcRoleAccessCreateAction;
