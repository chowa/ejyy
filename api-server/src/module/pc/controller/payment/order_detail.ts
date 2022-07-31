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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import config from '~/config';

interface RequestBody {
    community_id: number;
    order_id: number;
}

const PcPaymentOrderDetailAction = <Action>{
    router: {
        path: '/payment/order_detail',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CWGL]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'order_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, order_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_property_fee_order')
            .leftJoin('ejyy_property_fee', 'ejyy_property_fee.id', 'ejyy_property_fee_order.property_fee_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_property_fee_order.wechat_mp_user_id')
            .where('ejyy_property_fee_order.id', order_id)
            .andWhere('ejyy_property_fee.community_id', community_id)
            .select(
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
                'ejyy_property_fee.wechat_push',
                'ejyy_property_fee.sms_push',
                'ejyy_property_fee_order.id as order_id',
                'ejyy_property_fee_order.wechat_mp_user_id',
                'ejyy_property_fee_order.transaction_id',
                'ejyy_property_fee_order.paid',
                'ejyy_property_fee_order.paid_at',
                'ejyy_property_fee_order.refunded',
                'ejyy_property_fee_order.refunding',
                'ejyy_property_fee_order.cancel',
                'ejyy_property_fee_order.cancel_at',
                'ejyy_property_fee_order.is_cash',
                'ejyy_property_fee_order.fee',
                'ejyy_property_fee_order.paid_fee',
                'ejyy_property_fee_order.created_at',
                'ejyy_wechat_mp_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        const items = await ctx.model
            .from('ejyy_property_fee_order_item')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_property_fee_order_item.building_id')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_property_fee_order_item.refund_by'
            )
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
                'ejyy_property_fee_order_item.refund_request_source',
                'ejyy_property_company_user.id as operate_user_id',
                'ejyy_property_company_user.real_name as operate_user_real_name'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                info: {
                    ...info,
                    payExpire: config.wechat.pay.payExpire,
                    refoundExpire: config.wechat.pay.refoundExpire
                },
                items
            }
        };
    }
};

export default PcPaymentOrderDetailAction;
