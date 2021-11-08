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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import config from '~/config';

interface RequestParams {
    order_id: number;
}

const MpPaymentDetailAction = <Action>{
    router: {
        path: '/payment/detail/:order_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'order_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { order_id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ejyy_property_fee_order')
            .leftJoin('ejyy_property_fee', 'ejyy_property_fee.id', 'ejyy_property_fee_order.property_fee_id')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_property_fee.community_id')
            .where('ejyy_property_fee_order.id', order_id)
            .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(
                'ejyy_community_info.name as community_name',
                'ejyy_property_fee.start_year',
                'ejyy_property_fee.end_year',
                'ejyy_property_fee.house_fee',
                'ejyy_property_fee.computed_house_fee_by_area',
                'ejyy_property_fee.carport_fee',
                'ejyy_property_fee.computed_carport_fee_by_area',
                'ejyy_property_fee.warehoure_fee',
                'ejyy_property_fee.computed_warehouse_fee_by_area',
                'ejyy_property_fee.merchant_fee',
                'ejyy_property_fee.computed_merchant_fee_by_area',
                'ejyy_property_fee.garage_fee',
                'ejyy_property_fee.computed_garage_fee_by_area',
                'ejyy_property_fee_order.id as order_id',
                'ejyy_property_fee_order.transaction_id',
                'ejyy_property_fee_order.paid',
                'ejyy_property_fee_order.paid_at',
                'ejyy_property_fee_order.refunding',
                'ejyy_property_fee_order.refunded',
                'ejyy_property_fee_order.cancel',
                'ejyy_property_fee_order.cancel_at',
                'ejyy_property_fee_order.is_cash',
                'ejyy_property_fee_order.fee',
                'ejyy_property_fee_order.paid_fee',
                'ejyy_property_fee_order.created_at'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        const items = await ctx.model
            .from('ejyy_property_fee_order_item')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_property_fee_order_item.building_id')
            .where('ejyy_property_fee_order_item.property_fee_order_id', order_id)
            .select(
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_building_info.construction_area',
                'ejyy_property_fee_order_item.building_id',
                'ejyy_property_fee_order_item.id',
                'ejyy_property_fee_order_item.fee',
                'ejyy_property_fee_order_item.refund',
                'ejyy_property_fee_order_item.refund_id',
                'ejyy_property_fee_order_item.refund_fee',
                'ejyy_property_fee_order_item.refund_status',
                'ejyy_property_fee_order_item.refund_apply_at',
                'ejyy_property_fee_order_item.refund_at',
                'ejyy_property_fee_order_item.refund_recv_accout',
                'ejyy_property_fee_order_item.refund_account',
                'ejyy_property_fee_order_item.refund_request_source'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                detail,
                items,
                payExpire: config.wechat.pay.payExpire
            }
        };
    }
};

export default MpPaymentDetailAction;
