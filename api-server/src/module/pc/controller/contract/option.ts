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
