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
import { SUCCESS, PAYMENT_CREATE_ORDER_FAIL, PAYMENT_BUILDING_ILLEGAL } from '~/constant/code';
import { BINDING_BUILDING, FALSE, TRUE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';
import * as feeService from '~/service/fee';
import config from '~/config';
import utils from '~/utils';

interface RequestBody {
    community_id: number;
    property_fee_id: number;
    user_id: number;
    building_ids: number[];
}

const PcPaymentPayAction = <Action>{
    router: {
        path: '/payment/pay',
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
                name: 'property_fee_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'user_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'building_ids',
                min: 1,
                validator: val => Array.isArray(val) && val.every(id => /^\d+$/.test(id))
            }
        ]
    },
    response: async ctx => {
        const { user_id, community_id, property_fee_id, building_ids } = <RequestBody>ctx.request.body;

        const feeDetail = await ctx.model
            .from('ejyy_property_fee')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_property_fee.community_id')
            .where('ejyy_property_fee.id', property_fee_id)
            .andWhere('ejyy_property_fee.community_id', community_id)
            .select(
                'ejyy_property_fee.id',
                'ejyy_community_info.name',
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
            .first();

        if (!feeDetail) {
            return (ctx.body = {
                code: PAYMENT_CREATE_ORDER_FAIL,
                message: '非法的物业收费信息'
            });
        }

        const selfBuilding = await ctx.model
            .from('ejyy_user_building')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
            .where('ejyy_user_building.wechat_mp_user_id', user_id)
            .andWhere('ejyy_user_building.status', BINDING_BUILDING)
            .andWhere('ejyy_building_info.community_id', community_id)
            .whereIn('ejyy_user_building.building_id', building_ids)
            .select(
                'ejyy_building_info.id',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_building_info.construction_area'
            );

        if (selfBuilding.length !== building_ids.length) {
            return (ctx.body = {
                code: PAYMENT_BUILDING_ILLEGAL,
                message: '所属房产参数非法'
            });
        }

        // 查询是否存在下单或支付的
        const paiedItems = await ctx.model
            .from('ejyy_property_fee_order')
            .leftJoin(
                'ejyy_property_fee_order_item',
                'ejyy_property_fee_order_item.property_fee_order_id',
                'ejyy_property_fee_order.id'
            )
            .where('ejyy_property_fee_order.property_fee_id', property_fee_id)
            .andWhere('ejyy_property_fee_order.cancel', FALSE)
            .whereIn('ejyy_property_fee_order_item.building_id', building_ids)
            .where(function() {
                this.where(function() {
                    // 支付了 没有退款 并且没有申请退款；
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

        if (paiedItems.length > 0) {
            return (ctx.body = {
                code: PAYMENT_CREATE_ORDER_FAIL,
                message: '存在已支付或待支付的订单，请刷新后重试'
            });
        }

        const created_at = Date.now();
        const items = [];
        let total_fee = 0;

        selfBuilding.forEach(detail => {
            const fee = feeService.computed(detail, feeDetail);

            total_fee += fee;

            items.push({
                building_id: detail.id,
                fee
            });
        });

        const [order_id] = await ctx.model.from('ejyy_property_fee_order').insert({
            property_fee_id: property_fee_id,
            wechat_mp_user_id: user_id,
            fee: total_fee,
            is_cash: TRUE,
            paid: TRUE,
            paid_at: created_at,
            paid_fee: total_fee,
            transaction_id: utils.crypto.md5(`${Date.now()}${property_fee_id}${user_id}`),
            created_at
        });

        await ctx.model.from('ejyy_property_fee_order_item').insert(
            items.map(item => {
                return {
                    ...item,
                    property_fee_order_id: order_id
                };
            })
        );

        ctx.body = {
            code: SUCCESS,
            data: {
                order_id
            }
        };
    }
};

export default PcPaymentPayAction;
