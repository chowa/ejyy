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
import { SUCCESS, MISSION_POINT_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    local: string;
    category_id: number;
    community_id: number;
}

const PcMissionManagePointUpdateAction = <Action>{
    router: {
        path: '/mission_manage/point_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'local',
                max: 128,
                required: true
            },
            {
                name: 'category_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, local, category_id, community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_mission_point')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的巡检点'
            });
        }

        const repeat = await ctx.model
            .from('ejyy_mission_point')
            .where('community_id', community_id)
            .andWhere('local', local)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MISSION_POINT_EXIST,
                message: '巡检点已存在'
            });
        }

        const category = await ctx.model
            .from('ejyy_mission_category')
            .where('id', category_id)
            .first();

        if (!category) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的任务分类'
            });
        }

        await ctx.model
            .from('ejyy_mission_point')
            .update({
                local,
                category_id
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMissionManagePointUpdateAction;
