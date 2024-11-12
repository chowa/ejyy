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

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpFitmentListAction = <Action>{
    router: {
        path: '/fitment/list',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_fitment')
            .leftJoin('ejyy_community_setting', 'ejyy_community_setting.community_id', 'ejyy_fitment.community_id')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_fitment.community_id')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_fitment.building_id')
            .where('ejyy_fitment.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_fitment.id'))
            .select(
                'ejyy_community_setting.fitment_pledge',
                'ejyy_community_info.name as community_name',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_fitment.step',
                'ejyy_fitment.is_return_cash_deposit',
                'ejyy_fitment.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_fitment.id', 'desc');

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

export default MpFitmentListAction;
