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
    community_id: number;
    page_num: number;
    page_size: number;
}

const PcLampLineListAction = <Action>{
    router: {
        path: '/lamp/line_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHZM],
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
            .from('ejyy_iot_lamp_line')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_iot_lamp_line.created_by')
            .leftJoin('ejyy_iot_lamp', 'ejyy_iot_lamp.id', 'ejyy_iot_lamp_line.lamp_id')
            .where('ejyy_iot_lamp.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_iot_lamp_line.id'))
            .select(
                'ejyy_iot_lamp_line.id',
                'ejyy_iot_lamp_line.name',
                'ejyy_iot_lamp_line.port',
                'ejyy_iot_lamp_line.off',
                'ejyy_iot_lamp_line.lamp_id',
                'ejyy_iot_lamp_line.created_by',
                'ejyy_iot_lamp_line.created_at',
                'ejyy_property_company_user.real_name',
                'ejyy_iot_lamp.name as lamp'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_iot_lamp_line.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        let i = 0;
        for (const line of list) {
            const work_mode = await ctx.model
                .from('ejyy_iot_lamp_work_mode')
                .where('lamp_line_id', line.id)
                .select('name', 'start_time', 'end_time');

            list[i].work_mode = work_mode;
            i++;
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

export default PcLampLineListAction;
