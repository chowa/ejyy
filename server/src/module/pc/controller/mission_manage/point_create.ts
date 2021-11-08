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
import { SUCCESS, MISSION_POINT_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    local: string;
    category_id: number;
    community_id: number;
}

const PcMissionManagePointCreateAction = <Action>{
    router: {
        path: '/mission_manage/point_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
        verifyCommunity: true
    },
    validator: {
        body: [
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
        const { local, category_id, community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_mission_point')
            .where('community_id', community_id)
            .andWhere('local', local)
            .first();

        if (exist) {
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

        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_mission_point').insert({
            local,
            category_id,
            community_id,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcMissionManagePointCreateAction;
