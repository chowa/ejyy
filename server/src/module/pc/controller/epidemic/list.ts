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
import { GREEN_TOUR_CODE, YELLOW_TOUR_CODE, RED_TOUR_CODE } from '~/constant/epidemic';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    tour_code?: typeof GREEN_TOUR_CODE | typeof YELLOW_TOUR_CODE | typeof RED_TOUR_CODE;
    return_hometown?: typeof TRUE | typeof FALSE;
}

const PcEpidemicListAction = <Action>{
    router: {
        path: '/epidemic/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YQFK],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'tour_code',
                regex: /^1|2|3$/
            },
            {
                name: 'return_hometown',
                regex: /^1|0$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, tour_code, return_hometown } = <RequestBody>ctx.request.body;
        const where = {};

        if (tour_code) {
            where['ejyy_epidemic.tour_code'] = tour_code;
        }

        if (return_hometown !== undefined) {
            where['ejyy_epidemic.return_hometown'] = return_hometown;
        }

        const list = await ctx.model
            .from('ejyy_epidemic')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_epidemic.building_id')
            .where('ejyy_epidemic.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_epidemic.id'))
            .select(
                'ejyy_epidemic.id',
                'ejyy_epidemic.tour_code',
                'ejyy_epidemic.temperature',
                'ejyy_epidemic.return_hometown',
                'ejyy_epidemic.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_epidemic.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

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

export default PcEpidemicListAction;
