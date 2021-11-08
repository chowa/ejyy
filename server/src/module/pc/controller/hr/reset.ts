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
