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
import config from '~/config';
import { FALSE, TRUE, BINDING_BUILDING } from '~/constant/status';
import {
    EjyyBuildingInfo,
    EjyyPropertyFee,
    EjyyCommunityInfo,
    EjyyPropertyFeeOrder,
    EjyyPropertyFeeOrderItem
} from '~/types/model';

interface RequestParams {
    community_id: number;
}

const MpPaymentOrderAction = <Action>{
    router: {
        path: '/payment/order/:community_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestParams>ctx.params;
        const list = [];

        // 收费信息
        const fees = <(EjyyPropertyFee & EjyyCommunityInfo)[]>await ctx.model
            .from('ejyy_property_fee')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_property_fee.community_id')
            .where('community_id', community_id)
            .select(
                'ejyy_community_info.name as community_name',
                'ejyy_property_fee.id',
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
                'ejyy_property_fee.computed_garage_fee_by_area'
            )
            .orderBy('ejyy_property_fee.id', 'desc');

        for (const fee of fees) {
            // 是否存在未支付的订单
            const unpayOrder = <(EjyyPropertyFeeOrder & EjyyPropertyFeeOrderItem & EjyyBuildingInfo)[]>await ctx.model
                .from('ejyy_property_fee_order')
                .leftJoin(
                    'ejyy_property_fee_order_item',
                    'ejyy_property_fee_order_item.property_fee_order_id',
                    'ejyy_property_fee_order.id'
                )
                .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_property_fee_order_item.building_id')
                .where('ejyy_property_fee_order.wechat_mp_user_id', ctx.mpUserInfo.id)
                .andWhere('ejyy_property_fee_order.paid', FALSE)
                .andWhere('ejyy_property_fee_order.created_at', '>=', Date.now() - config.wechat.pay.payExpire)
                .andWhere('ejyy_property_fee_order.property_fee_id', fee.id)
                .andWhere('ejyy_property_fee_order.cancel', FALSE)
                .whereNotNull('ejyy_property_fee_order.prepay_id')
                .select(
                    'ejyy_property_fee_order.id',
                    'ejyy_property_fee_order.created_at',
                    'ejyy_property_fee_order_item.building_id',
                    'ejyy_building_info.id as building_id',
                    'ejyy_building_info.type',
                    'ejyy_building_info.area',
                    'ejyy_building_info.building',
                    'ejyy_building_info.unit',
                    'ejyy_building_info.number',
                    'ejyy_building_info.construction_area',
                    'ejyy_property_fee_order_item.fee'
                );

            const uncreateOrder = <EjyyBuildingInfo[]>await ctx.model
                .from('ejyy_user_building')
                .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
                .where('ejyy_building_info.community_id', community_id)
                .andWhere('ejyy_user_building.wechat_mp_user_id', ctx.mpUserInfo.id)
                .andWhere('ejyy_user_building.status', BINDING_BUILDING)
                .whereNotIn('ejyy_building_info.id', function() {
                    this.from('ejyy_property_fee')
                        .leftJoin(
                            'ejyy_property_fee_order',
                            'ejyy_property_fee_order.property_fee_id',
                            'ejyy_property_fee.id'
                        )
                        .leftJoin(
                            'ejyy_property_fee_order_item',
                            'ejyy_property_fee_order_item.property_fee_order_id',
                            'ejyy_property_fee_order.id'
                        )
                        .where('ejyy_property_fee.id', fee.id)
                        .andWhere('ejyy_property_fee.community_id', community_id)
                        .andWhere('ejyy_property_fee_order.cancel', FALSE)
                        .andWhere(function() {
                            this.where(function() {
                                this.where('ejyy_property_fee_order.paid', TRUE)
                                    .andWhere('ejyy_property_fee_order_item.refund', FALSE)
                                    .whereNull('ejyy_property_fee_order_item.refund_apply_at');
                            }).orWhere(function() {
                                this.where('ejyy_property_fee_order.paid', FALSE).andWhere(
                                    'ejyy_property_fee_order.created_at',
                                    '>=',
                                    Date.now() - config.wechat.pay.payExpire
                                );
                            });
                        })
                        .select('ejyy_property_fee_order_item.building_id');
                })
                .select(
                    'ejyy_building_info.community_id',
                    'ejyy_building_info.id as building_id',
                    'ejyy_building_info.type',
                    'ejyy_building_info.area',
                    'ejyy_building_info.building',
                    'ejyy_building_info.unit',
                    'ejyy_building_info.number',
                    'ejyy_building_info.construction_area'
                );

            if (unpayOrder.length || uncreateOrder.length) {
                list.push({
                    fee,
                    unpayOrder,
                    uncreateOrder
                });
            }
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpPaymentOrderAction;
