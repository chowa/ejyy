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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import * as payService from '~/service/pay';
import { PAY_SUCCESS, REFUND_SUCCESS } from '~/constant/pay';
import { TRUE, FALSE } from '~/constant/status';
import utils from '~/utils';
import config from '~/config';

interface RequestBody {
    community_id: number;
    order_id: number;
    order_item_id: number;
    refund_recv_accout?: string;
}

const PcPaymentRefundAction = <Action>{
    router: {
        path: '/payment/refund',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'order_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'order_item_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'refund_recv_accout',
                max: 64
            }
        ]
    },
    response: async ctx => {
        const { order_id, community_id, order_item_id, refund_recv_accout } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_property_fee_order_item')
            .leftJoin(
                'ejyy_property_fee_order',
                'ejyy_property_fee_order.id',
                'ejyy_property_fee_order_item.property_fee_order_id'
            )
            .leftJoin('ejyy_property_fee', 'ejyy_property_fee.id', 'ejyy_property_fee_order.property_fee_id')
            .where('ejyy_property_fee_order.id', order_id)
            .where('ejyy_property_fee_order_item.id', order_item_id)
            .andWhere('ejyy_property_fee.community_id', community_id)
            .select(
                'ejyy_property_fee_order_item.id',
                'ejyy_property_fee_order_item.fee',
                'ejyy_property_fee_order_item.refund_apply_at',
                'ejyy_property_fee_order_item.refund_by',
                'ejyy_property_fee_order_item.refund',
                'ejyy_property_fee_order.created_at',
                'ejyy_property_fee_order.paid',
                'ejyy_property_fee_order.paid_fee',
                'ejyy_property_fee_order.is_cash',
                'ejyy_property_fee_order.fee as total_fee'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        if (detail.paid === FALSE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '订单状态错误'
            });
        }

        if (detail.refund_apply_at || detail.refund_by || detail.refund === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '订单已退款'
            });
        }

        //  半个月内可以退款
        if (detail.created_at < Date.now() - config.wechat.pay.refoundExpire) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: `支付时间超过${Math.floor(
                    config.wechat.pay.refoundExpire / (1000 * 60 * 60 * 24)
                )}天，无法退款`
            });
        }

        const refund_apply_at = Date.now();
        let refund_id = undefined;

        if (detail.is_cash) {
            refund_id = utils.crypto.md5(`${Date.now()}${detail.fee}${order_item_id}`);
            await ctx.model
                .from('ejyy_property_fee_order_item')
                .update({
                    refund_by: ctx.pcUserInfo.id,
                    refund_at: refund_apply_at,
                    refund_apply_at: refund_apply_at,
                    refund_id,
                    refund: TRUE,
                    refund_fee: detail.fee,
                    refund_recv_accout: refund_recv_accout ? refund_recv_accout : null,
                    refund_status: REFUND_SUCCESS,
                    refund_request_source: '现场办理'
                })
                .where('property_fee_order_id', order_id)
                .where('id', order_item_id);

            const haveRefundingItem = await ctx.model
                .from('ejyy_property_fee_order_item')
                .where('property_fee_order_id', order_id)
                .whereNotNull('refund_apply_at')
                .andWhere('refund', FALSE)
                .first();

            await ctx.model
                .from('ejyy_property_fee_order')
                .update({
                    refunding: TRUE,
                    refunded: !haveRefundingItem ? TRUE : FALSE,
                    paid_fee: detail.paid_fee - detail.fee
                })
                .where('id', order_id);
        } else {
            const res = await payService.refund({
                order_id,
                order_item_id,
                created_at: detail.created_at,
                total_fee: detail.total_fee,
                refund_fee: detail.fee
            });

            if (res.return_code !== PAY_SUCCESS || res.result_code !== PAY_SUCCESS) {
                return (ctx.body = {
                    code: STATUS_ERROR,
                    message: `退款失败，${res.return_msg}`
                });
            }

            await ctx.model
                .from('ejyy_property_fee_order')
                .update({
                    refunding: TRUE,
                    refunded: FALSE
                })
                .where('id', order_id);

            await ctx.model
                .from('ejyy_property_fee_order_item')
                .update({
                    refund_by: ctx.pcUserInfo.id,
                    refund_apply_at
                })
                .where('property_fee_order_id', order_id)
                .andWhere('id', order_item_id);
        }

        ctx.body = {
            code: SUCCESS,
            message: '退款申请成功',
            data: {
                refund_apply_at,
                refund_id
            }
        };
    }
};

export default PcPaymentRefundAction;
