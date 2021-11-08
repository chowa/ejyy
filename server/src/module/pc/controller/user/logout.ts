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
import { SUCCESS } from '~/constant/code';

const PcUserLogoutAction = <Action>{
    router: {
        path: '/user/logout',
        method: 'get',
        authRequired: true
    },
    response: async ctx => {
        await ctx.model
            .from('ejyy_property_company_auth')
            .where({ property_company_user_id: ctx.pcUserInfo.id })
            .update({
                token: null
            });

        ctx.body = {
            code: SUCCESS,
            message: '账号已退出'
        };
    }
};

export default PcUserLogoutAction;
