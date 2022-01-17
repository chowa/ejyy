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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import moment from 'moment';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcMissionMyAction = <Action>{
    router: {
        path: '/mission/my',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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

        const records = await ctx.model
            .from('ejyy_mission')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_mission.created_by')
            .leftJoin('ejyy_mission_category', 'ejyy_mission_category.id', 'ejyy_mission.category_id')
            .leftJoin('ejyy_mission_line', 'ejyy_mission_line.id', 'ejyy_mission.line_id')
            .where('ejyy_mission.community_id', community_id)
            .andWhere('ejyy_mission.user_id', ctx.pcUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_mission.id'))
            .select(
                'ejyy_mission.id',
                'ejyy_mission.start_date',
                'ejyy_mission.end_date',
                'ejyy_mission.start_hour',
                'ejyy_mission.end_hour',
                'ejyy_mission.cancel',
                'ejyy_mission.created_at',
                'ejyy_mission.created_by',
                'ejyy_property_company_user.real_name',
                'ejyy_mission_category.name as category',
                'ejyy_mission_line.name as line'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_mission.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));
        const list = [];
        const date = moment()
            .startOf('day')
            .valueOf();

        for (const record of records) {
            let finish = 0;

            if (record.start_date <= date && date <= record.end_date) {
                const completeInfo = await ctx.model
                    .from('ejyy_mission_complete')
                    .where('mission_id', record.id)
                    .andWhere('date', date)
                    .first();

                if (completeInfo) {
                    finish = completeInfo.finish;
                }
            }

            list.push({
                ...record,
                finish
            });
        }

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

export default PcMissionMyAction;
