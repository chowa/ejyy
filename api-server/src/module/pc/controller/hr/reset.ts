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
import * as ROLE from '~/constant/role_access';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import utils from '~/utils';

interface RequestBody {
    user_id: number;
    password: string;
}

const PcHrResetAction = <Action>{
    router: {
        path: '/hr/reset',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        body: [
            {
                name: 'user_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'password',
                required: true,
                max: 32
            }
        ]
    },
    response: async ctx => {
        const { user_id, password } = <RequestBody>ctx.request.body;

        const affect = await ctx.model
            .from('ejyy_property_company_user')
            .where('id', user_id)
            .update('password', utils.crypto.md5(password));

        if (affect !== 1) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '重置人事登录密码失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '重置人事登录密码成功'
        };
    }
};

export default PcHrResetAction;
