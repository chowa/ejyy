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

const PcMissionManageLineDetailAction = <Action>{
    router: {
        path: '/mission_manage/line_detail',
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
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_mission_line')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_mission_line.created_by')
            .leftJoin('ejyy_mission_category', 'ejyy_mission_category.id', 'ejyy_mission_line.category_id')
            .where('ejyy_mission_line.community_id', community_id)
            .andWhere('ejyy_mission_line.id', id)
            .select(
                'ejyy_mission_line.id',
                'ejyy_mission_line.name',
                'ejyy_mission_line.description',
                'ejyy_mission_line.category_id',
                'ejyy_mission_line.created_at',
                'ejyy_mission_line.created_by',
                'ejyy_property_company_user.real_name',
                'ejyy_mission_category.name as category'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法查询巡检路线'
            });
        }

        const points = await ctx.model
            .from('ejyy_mission_line_node')
            .leftJoin('ejyy_mission_point', 'ejyy_mission_point.id', 'ejyy_mission_line_node.point_id')
            .where('ejyy_mission_line_node.line_id', id)
            .select('ejyy_mission_point.id', 'ejyy_mission_point.local');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                points
            }
        };
    }
};

export default PcMissionManageLineDetailAction;
