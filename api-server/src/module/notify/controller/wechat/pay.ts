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

import RawBody from 'raw-body';
import moment from 'moment';
import { NotifyAction } from '~/types/action';
import { TRUE } from '~/constant/status';
import * as payService from '~/service/pay';
import * as wechatService from '~/service/wechat';
import { PAY_SUCCESS, PAY_FAIL } from '~/constant/pay';
import config from '~/config';

interface WechatPayNotify {
    return_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg: string;
    result_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    appid: string;
    mch_id: string;
    sub_mch_id: string;
    device_info: string;
    nonce_str: string;
    sign: string;
    sign_type: string;
    err_code: string;
    openid: string;
    is_subscribe: string;
    trade_type: string;
    bank_type: string;
    total_fee: number;
    fee_type: string;
    cash_fee: number;
    cash_fee_type: string;
    settlement_total_fee: number;
    coupon_fee: number;
    coupon_count: number;
    transaction_id: string;
    out_trade_no: string;
    attach: string;
    time_end: string;
}

const NotifyWechatPayAction = <NotifyAction>{
    router: {
        path: '/wechat/pay',
        method: 'post'
    },
    response: async ctx => {
        const xml = await RawBody(ctx.req, {
            length: ctx.request.length,
            limit: '1mb',
            encoding: ctx.request.charset || 'utf-8'
        });

        const notify = <WechatPayNotify>await wechatService.parseXML(xml);
        const orderId = payService.attachDecode(notify.attach);

        if (config.debug) {
            console.log(notify);
        }

        if (
            notify.return_code === PAY_SUCCESS &&
            notify.result_code === PAY_SUCCESS &&
            notify.appid === config.wechat.ump.appid &&
            notify.mch_id === config.wechat.pay.mch_id &&
            orderId === payService.tradeNoToId(notify.out_trade_no) &&
            payService.verifyNonceStr(orderId, notify.nonce_str)
        ) {
            const mpUserInfo = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('open_id', notify.openid)
                .first();

            const detail = await ctx.model
                .from('ejyy_property_fee_order')
                .where('id', orderId)
                .andWhere('wechat_mp_user_id', mpUserInfo.id)
                .first();

            await ctx.model
                .from('ejyy_property_fee_order')
                .update({
                    transaction_id: notify.transaction_id,
                    paid: TRUE,
                    paid_fee: detail.fee,
                    paid_at: moment(notify.time_end, 'YYYYMMDDHHmmss').valueOf()
                })
                .where('id', orderId)
                .andWhere('wechat_mp_user_id', mpUserInfo.id);
        }

        ctx.res.setHeader('Content-Type', 'application/xml');

        ctx.body = wechatService.buildXML({ return_code: PAY_SUCCESS });
    }
};

export default NotifyWechatPayAction;
