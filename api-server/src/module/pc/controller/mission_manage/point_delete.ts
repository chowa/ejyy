/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, STATUS_ERROR, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMissionManagePointDeleteAction = <Action>{
    router: {
        path: '/mission_manage/point_delete',
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
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

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

        const lineUsed = await ctx.model
            .from('ejyy_mission_line_node')
            .where('point_id', id)
            .first();

        if (lineUsed) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检路线正在使用该巡检点，不可删除'
            });
        }

        const completeUsed = await ctx.model
            .from('ejyy_mission_complete_node')
            .where('point_id', id)
            .first();

        if (completeUsed) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检任务正在使用该巡检点，不可删除'
            });
        }

        await ctx.model
            .from('ejyy_mission_point')
            .where('id', id)
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMissionManagePointDeleteAction;
