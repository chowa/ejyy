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

interface RequestBody {
    community_id: number;
}

const PcMissionManageOptionAction = <Action>{
    router: {
        path: '/mission_manage/option',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
        verifyCommunity: true
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

        const category = await ctx.model.from('ejyy_mission_category').select('id', 'name', 'description');

        const point = await ctx.model
            .from('ejyy_mission_point')
            .where('community_id', community_id)
            .select('id', 'local', 'category_id');

        const line = await ctx.model
            .from('ejyy_mission_line')
            .where('community_id', community_id)
            .select('id', 'category_id', 'name', 'description');

        ctx.body = {
            code: SUCCESS,
            data: {
                category,
                point,
                line
            }
        };
    }
};

export default PcMissionManageOptionAction;
