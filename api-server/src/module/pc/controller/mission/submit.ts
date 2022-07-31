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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import momment from 'moment';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
    complete_id: number;
    point_id: number;
    normal: typeof TRUE | typeof FALSE;
    remark: string;
    img1: string;
    img2?: string;
    img3?: string;
}

const PcMissionSubmitAction = <Action>{
    router: {
        path: '/mission/submit',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE]
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
            },
            {
                name: 'complete_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'point_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'normal',
                regex: /^1|0$/,
                required: true
            },
            {
                name: 'remark',
                max: 256
            },
            {
                name: 'img1',
                regex: /^\/mission\/[a-z0-9]{32}\.(jpg|jpeg|png)$/,
                required: true
            },
            {
                name: 'img2',
                regex: /^\/mission\/[a-z0-9]{32}\.(jpg|jpeg|png)$/
            },
            {
                name: 'img3',
                regex: /^\/mission\/[a-z0-9]{32}\.(jpg|jpeg|png)$/
            }
        ]
    },
    response: async ctx => {
        const { id, complete_id, community_id, point_id, remark, normal, img1, img2, img3 } = <RequestBody>(
            ctx.request.body
        );

        const mission = await ctx.model
            .from('ejyy_mission')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('user_id', ctx.pcUserInfo.id)
            .first();

        if (!mission) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的巡检任务'
            });
        }

        if (mission.start_date > Date.now() || mission.end_date < Date.now()) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检任务未到开始日期或已逾期，不可提交'
            });
        }

        if (mission.start_hour > momment().hour() || mission.end_hour < momment().hour()) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检时间未到开始时间或已经超时，不可提交'
            });
        }

        if (mission.cancel) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检任务已取消，不可提交'
            });
        }

        const info = await ctx.model
            .from('ejyy_mission_complete')
            .andWhere('id', complete_id)
            .andWhere('mission_id', id)
            .first();

        if (!info || info.finish === TRUE) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法提交化巡检任务'
            });
        }

        const lineInfo = await ctx.model
            .from('ejyy_mission_line_node')
            .leftJoin('ejyy_mission_point', 'ejyy_mission_point.id', 'ejyy_mission_line_node.point_id')
            .where('ejyy_mission_line_node.line_id', mission.line_id)
            .select('ejyy_mission_point.local', 'ejyy_mission_point.id');

        const index = lineInfo.findIndex(record => record.id === point_id);

        if (index < 0) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检点非法'
            });
        }

        const submited = await ctx.model
            .from('ejyy_mission_complete_node')
            .where('complete_id', complete_id)
            .andWhere('point_id', point_id)
            .first();

        if (info.point_id === point_id || submited) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检点已提交过'
            });
        }

        await ctx.model.from('ejyy_mission_complete_node').insert({
            complete_id,
            point_id,
            remark: remark ? remark : null,
            normal,
            img1,
            img2: img2 ? img2 : null,
            img3: img3 ? img3 : null,
            created_at: Date.now()
        });

        const finish = index === lineInfo.length - 1 ? TRUE : FALSE;

        await ctx.model
            .from('ejyy_mission_complete')
            .where('id', complete_id)
            .update({
                point_id,
                finish
            });

        ctx.body = {
            code: SUCCESS,
            data: {
                finish
            }
        };
    }
};

export default PcMissionSubmitAction;
