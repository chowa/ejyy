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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import momment from 'moment';
import { FALSE, TRUE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMissionInitAction = <Action>{
    router: {
        path: '/mission/init',
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
            .where('community_id', community_id)
            .andWhere('id', id)
            .andWhere('user_id', ctx.pcUserInfo.id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法初始化巡检任务'
            });
        }

        if (info.start_date > Date.now() || info.end_date < Date.now()) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检任务未到开始日期或已逾期'
            });
        }

        if (info.start_hour > momment().hour() || info.end_hour < momment().hour()) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检时间未到开始时间或已经超时'
            });
        }

        const date = momment()
            .startOf('day')
            .valueOf();
        let complete_id = null;
        let point_id = null;

        const exist = await ctx.model
            .from('ejyy_mission_complete')
            .where('mission_id', id)
            .andWhere('date', date)
            .first();

        if (exist) {
            if (exist.finish === TRUE) {
                return (ctx.body = {
                    code: STATUS_ERROR,
                    message: '今日巡检任务已完成'
                });
            }

            complete_id = exist.id;
            point_id = exist.point_id;
        } else {
            [complete_id] = await ctx.model.from('ejyy_mission_complete').insert({
                mission_id: id,
                point_id,
                finish: FALSE,
                date,
                created_by: ctx.pcUserInfo.id,
                created_at: Date.now()
            });
        }

        const lineInfo = await ctx.model
            .from('ejyy_mission_line_node')
            .leftJoin('ejyy_mission_point', 'ejyy_mission_point.id', 'ejyy_mission_line_node.point_id')
            .where('ejyy_mission_line_node.line_id', info.line_id)
            .select('ejyy_mission_point.local', 'ejyy_mission_point.id');

        ctx.body = {
            code: SUCCESS,
            data: {
                complete_id,
                point_id,
                lineInfo
            }
        };
    }
};

export default PcMissionInitAction;
