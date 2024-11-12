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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import config from '~/config';
import * as payService from '~/service/pay';

interface RequestParams {
    id: number;
}

const MpPaymentPayAction = <Action>{
    router: {
        path: '/payment/pay/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ejyy_property_fee_order')
            .where('id', id)
            .where('ejyy_property_fee_order.wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的支付订单'
            });
        }

        if (Date.now() - detail.created_at >= config.wechat.pay.payExpire) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '订单已超时'
            });
        }

        const payParams = {
            appId: config.wechat.ump.appid,
            timeStamp: Math.floor(Date.now() / 1000).toString(),
            nonceStr: payService.getNonceStr(id),
            package: `prepay_id=${detail.prepay_id}`,
            signType: 'MD5'
        };

        ctx.body = {
            code: SUCCESS,
            data: {
                ...payParams,
                paySign: await payService.getSign(payParams, id)
            }
        };
    }
};

export default MpPaymentPayAction;
