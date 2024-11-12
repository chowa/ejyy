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
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcMissionAllAction = <Action>{
    router: {
        path: '/mission/all',
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
            },
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_mission')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_mission.user_id')
            .leftJoin('ejyy_mission_category', 'ejyy_mission_category.id', 'ejyy_mission.category_id')
            .leftJoin('ejyy_mission_line', 'ejyy_mission_line.id', 'ejyy_mission.line_id')
            .where('ejyy_mission.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_mission.id'))
            .select(
                'ejyy_mission.id',
                'ejyy_mission.start_date',
                'ejyy_mission.end_date',
                'ejyy_mission.start_hour',
                'ejyy_mission.end_hour',
                'ejyy_mission.cancel',
                'ejyy_mission.created_at',
                'ejyy_mission.user_id',
                'ejyy_property_company_user.real_name',
                'ejyy_mission_category.name as category',
                'ejyy_mission_line.name as line'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_mission.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcMissionAllAction;
