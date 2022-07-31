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
import { FALSE } from '~/constant/status';
import moment from 'moment';

interface RequestBody {
    community_id: number;
    category_id: number;
    start_date: number;
    end_date: number;
    start_hour: number;
    end_hour: number;
    line_id: number;
    user_id: number;
}

const PcMissionCreateAction = <Action>{
    router: {
        path: '/mission/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'category_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'start_date',
                required: true,
                regex: /^\d{13}$/
            },
            {
                name: 'end_date',
                required: true,
                regex: /^\d{13}$/
            },
            {
                name: 'start_hour',
                required: true,
                regex: /^\d+$/,
                validator: val => val >= 0 && val <= 23
            },
            {
                name: 'end_hour',
                required: true,
                regex: /^\d+$/,
                validator: val => val >= 0 && val <= 23
            },
            {
                name: 'line_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'user_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { category_id, community_id, start_date, end_date, start_hour, end_hour, line_id, user_id } = <
            RequestBody
        >ctx.request.body;

        const category = await ctx.model
            .from('ejyy_mission_category')
            .andWhere('id', category_id)
            .first();

        if (!category) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的任务分类'
            });
        }

        const line = await ctx.model
            .from('ejyy_mission_line')
            .where('community_id', community_id)
            .andWhere('id', line_id)
            .first();

        if (!line) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的巡检路线'
            });
        }

        if (
            start_hour >= end_hour ||
            start_hour < 0 ||
            start_hour > 23 ||
            end_hour < 1 ||
            end_hour > 23 ||
            start_date === end_date ||
            start_date < Date.now() - 1000 * 24 * 60 * 60
        ) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '参数异常'
            });
        }

        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_mission').insert({
            category_id,
            community_id,
            start_date: moment(start_date)
                .startOf('day')
                .valueOf(),
            end_date: moment(end_date)
                .endOf('day')
                .valueOf(),
            start_hour,
            end_hour,
            line_id,
            user_id,
            cancel: FALSE,
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

export default PcMissionCreateAction;
