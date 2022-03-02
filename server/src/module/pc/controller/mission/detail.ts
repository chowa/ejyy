/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMissionDetailAction = <Action>{
    router: {
        path: '/mission/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_mission')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_mission.user_id')
            .leftJoin('ejyy_mission_category', 'ejyy_mission_category.id', 'ejyy_mission.category_id')
            .leftJoin('ejyy_mission_line', 'ejyy_mission_line.id', 'ejyy_mission.line_id')
            .where('ejyy_mission.community_id', community_id)
            .andWhere('ejyy_mission.id', id)
            .select(
                'ejyy_mission.id',
                'ejyy_mission.start_date',
                'ejyy_mission.end_date',
                'ejyy_mission.start_hour',
                'ejyy_mission.end_hour',
                'ejyy_mission.cancel',
                'ejyy_mission.canceled_at',
                'ejyy_mission.created_at',
                'ejyy_mission.created_by',
                'ejyy_mission.user_id',
                'ejyy_property_company_user.real_name',
                'ejyy_mission_category.name as category',
                'ejyy_mission_line.name as line'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取巡检任务'
            });
        }

        const disposeInfo = await ctx.model
            .from('ejyy_property_company_user')
            .where('id', info.created_by)
            .select('id', 'real_name')
            .first();

        const complete = await ctx.model
            .from('ejyy_mission_complete')
            .where('mission_id', id)
            .select('id', 'finish', 'point_id', 'date', 'created_at');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                disposeInfo,
                complete
            }
        };
    }
};

export default PcMissionDetailAction;
