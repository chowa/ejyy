/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    USER_SUBMIT_APPLY_STEP,
    PROPERTY_COMPANY_ALLOW_STEP,
    USER_FINISH_FITMENT_STEP,
    PROPERTY_COMPANY_CONFIRM_STEP
} from '~/constant/fitment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    step?:
        | typeof USER_SUBMIT_APPLY_STEP
        | typeof PROPERTY_COMPANY_ALLOW_STEP
        | typeof USER_FINISH_FITMENT_STEP
        | typeof PROPERTY_COMPANY_CONFIRM_STEP;
    is_return_cash_deposit?: boolean;
}

const PcFitmentListAction = <Action>{
    router: {
        path: '/fitment/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZXDJ],
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
                name: 'step',
                regex: /^1|2|3|4$/
            },
            {
                name: 'is_return_cash_deposit',
                regex: /^1|0$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, step, is_return_cash_deposit } = <RequestBody>ctx.request.body;
        const where = {};

        if (step) {
            where['ejyy_fitment.step'] = step;
        }

        if (is_return_cash_deposit !== undefined) {
            where['ejyy_fitment.is_return_cash_deposit'] = is_return_cash_deposit;
        }

        const list = await ctx.model
            .from('ejyy_fitment')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_fitment.building_id')
            .where('ejyy_fitment.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_fitment.id'))
            .select(
                'ejyy_fitment.id',
                'ejyy_fitment.step',
                'ejyy_fitment.is_return_cash_deposit',
                'ejyy_fitment.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
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

export default PcFitmentListAction;
