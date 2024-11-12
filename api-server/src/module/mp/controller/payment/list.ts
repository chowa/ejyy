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
import config from '~/config';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpPaymentListAction = <Action>{
    router: {
        path: '/payment/list',
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
            .from('ejyy_property_fee_order')
            .leftJoin('ejyy_property_fee', 'ejyy_property_fee.id', 'ejyy_property_fee_order.property_fee_id')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_property_fee.community_id')
            .where('ejyy_property_fee_order.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_property_fee_order.id'))
            .select(
                'ejyy_community_info.name as community_name',
                'ejyy_property_fee.start_year',
                'ejyy_property_fee.end_year',
                'ejyy_property_fee.house_fee',
                'ejyy_property_fee_order.id as order_id',
                'ejyy_property_fee_order.transaction_id',
                'ejyy_property_fee_order.paid',
                'ejyy_property_fee_order.refunding',
                'ejyy_property_fee_order.refunded',
                'ejyy_property_fee_order.cancel',
                'ejyy_property_fee_order.fee',
                'ejyy_property_fee_order.paid_fee',
                'ejyy_property_fee_order.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_property_fee_order.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size,
                payExpire: config.wechat.pay.payExpire
            }
        };
    }
};

export default MpPaymentListAction;
