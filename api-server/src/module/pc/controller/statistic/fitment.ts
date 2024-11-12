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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const StatisticFitmentAction = <Action>{
    router: {
        path: '/statistic/fitment',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_fitment')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_fitment.building_id')
            .where('ejyy_fitment.community_id', community_id)
            .select('ejyy_fitment.cash_deposit', 'ejyy_fitment.is_return_cash_deposit', 'ejyy_fitment.created_at');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default StatisticFitmentAction;
