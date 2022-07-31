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

import crypto from 'crypto';
import RawBody from 'raw-body';
import moment from 'moment';
import utils from '~/utils';
import { NotifyAction } from '~/types/action';
import * as wechatService from '~/service/wechat';
import { TRUE, FALSE } from '~/constant/status';
import * as payService from '~/service/pay';
import { PAY_SUCCESS, PAY_FAIL, REFUND_SUCCESS, REFUND_CHANGE, REFUND_REFUNDCLOSE } from '~/constant/pay';
import config from '~/config';

interface WechatRefundNotify {
    return_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg: string;
    appid: string;
    mch_id: string;
    sub_mch_id: string;
    nonce_str: string;
    req_info: string;
}

interface ReqInfo {
    transaction_id: string;
    out_trade_no: string;
    refund_id: string;
    out_refund_no: string;
    total_fee: number;
    settlement_total_fee: number;
    refund_fee: number;
    settlement_refund_fee: number;
    refund_status: 'SUCCESS' | 'CHANGE' | 'REFUNDCLOSE';
    success_time: string;
    refund_recv_accout: string;
    refund_account: string;
    refund_request_source: string;
}

const NotifyWechatRefundAction = <NotifyAction>{
    router: {
        path: '/notify/refund',
        method: 'post'
    },
    response: async ctx => {
        const xml = await RawBody(ctx.req, {
            length: ctx.request.length,
            limit: '1mb',
            encoding: ctx.request.charset || 'utf-8'
        });

        const notify = <WechatRefundNotify>await wechatService.parseXML(xml);

        if (config.debug) {
            console.log(notify);
        }

        if (
            notify.return_code === PAY_SUCCESS &&
            notify.appid === config.wechat.ump.appid &&
            notify.mch_id === config.wechat.pay.mch_id
        ) {
            const cipher = crypto.createDecipheriv(
                'aes-256-ecb',
                utils.crypto.md5(config.wechat.pay.key),
                Buffer.alloc(0)
            );
            const decrypted = cipher.update(notify.req_info, 'base64', 'utf8');
            const infoXml = decrypted + cipher.final('utf8');

            const info = <ReqInfo>await wechatService.parseXML(infoXml);
            const orderId = payService.tradeNoToId(info.out_trade_no);
            const orderItemId = payService.tradeNoToId(info.out_refund_no);

            if (config.debug) {
                console.log(info);
            }

            let status = null;

            switch (info.refund_status) {
                case 'SUCCESS':
                    status = REFUND_SUCCESS;
                    break;

                case 'CHANGE':
                    status = REFUND_CHANGE;
                    break;

                case 'REFUNDCLOSE':
                    status = REFUND_REFUNDCLOSE;
                    break;
            }

            await ctx.model
                .from('ejyy_property_fee_order_item')
                .update({
                    refund_at: info.success_time ? moment(info.success_time, 'YYYY-MM-DD HH:mm:ss').valueOf() : null,
                    refund_id: info.refund_id,
                    refund: TRUE,
                    refund_fee: info.refund_fee,
                    refund_account: info.refund_account,
                    refund_recv_accout: info.refund_recv_accout,
                    refund_status: status,
                    refund_request_source: info.refund_request_source
                })
                .where('property_fee_order_id', orderId)
                .where('id', orderItemId);

            const orderDetail = await ctx.model
                .from('ejyy_property_fee_order')
                .where('id', orderId)
                .first();
            const haveRefundingItem = await ctx.model
                .from('ejyy_property_fee_order_item')
                .where('property_fee_order_id', orderId)
                .whereNotNull('refund_apply_at')
                .andWhere('refund', FALSE)
                .first();

            await ctx.model
                .from('ejyy_property_fee_order')
                .update({
                    refunded: !haveRefundingItem ? TRUE : FALSE,
                    paid_fee: orderDetail.paid_fee - (info.success_time ? info.refund_fee : 0)
                })
                .where('id', orderId);
        }

        ctx.res.setHeader('Content-Type', 'application/xml');

        ctx.body = wechatService.buildXML({ return_code: PAY_SUCCESS });
    }
};

export default NotifyWechatRefundAction;
