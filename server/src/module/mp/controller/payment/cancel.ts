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
import { SUCCESS, QUERY_ILLEFAL, PAYMENT_CANCEL_ORDER_FAIL, STATUS_ERROR } from '~/constant/code';
import { PAY_FAIL } from '~/constant/pay';
import { TRUE } from '~/constant/status';
import config from '~/config';
import * as payService from '~/service/pay';

interface RequestParams {
    order_id: number;
}

const MpPaymentCancelAction = <Action>{
    router: {
        path: '/payment/cancel/:order_id',
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
            .where('id', order_id)
            .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        if (detail.cancel === TRUE || detail.paid === TRUE || detail.refunding === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '订单状态错误'
            });
        }

        // 如果支付未超时就关闭订单
        if (Date.now() - detail.created_at < config.wechat.pay.payExpire) {
            const res = await payService.closeOrder({
                order_id,
                created_at: detail.created_at
            });

            if (res.result_code === PAY_FAIL || res.return_code === PAY_FAIL) {
                return (ctx.body = {
                    code: PAYMENT_CANCEL_ORDER_FAIL,
                    message: res.return_msg
                });
            }
        }

        await ctx.model
            .from('ejyy_property_fee_order')
            .update({
                cancel: TRUE,
                cancel_at: Date.now()
            })
            .where('id', order_id);

        ctx.body = {
            code: SUCCESS,
            message: '取消订单成功'
        };
    }
};

export default MpPaymentCancelAction;
