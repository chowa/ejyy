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
import * as ROLE from '~/constant/role_access';

const PcContractOptionAction = <Action>{
    router: {
        path: '/contract/option',
        method: 'get',
        authRequired: true,
        roles: [ROLE.HTGL]
    },
    response: async ctx => {
        const list = await ctx.model
            .from('ejyy_contract_category')
            .select('id', 'name', 'description')
            .orderBy('id');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcContractOptionAction;
