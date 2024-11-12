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

import https from 'https';
import fs from 'fs';
import axios from 'axios';
import { v4 } from 'public-ip';
import moment from 'moment';
import config from '~/config';
import utils from '~/utils';
import { PAY_SUCCESS, PAY_FAIL } from '~/constant/pay';
import * as wechatService from '~/service/wechat';
// 文档 参考 https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_sl_api.php?chapter=9_16
// const pip = await import('public-ip/index.js');

interface Good {
    // building_id
    goods_id: number;
    goods_name: string;
    quantity: 1;
    price: number;
}

interface UnifiedOrderParams {
    community_name: string;
    goods: Good[];
    order_id: number;
    created_at: number;
    total_fee: number;
    openid: string;
}

interface UnifiedOrderResponse {
    return_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    result_code?: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg: string;
    appid?: string;
    mch_id?: string;
    sub_appid?: string;
    nonce_str?: string;
    sign?: string;
    err_code?: string;
    err_code_des?: string;
    trade_type?: string;
    prepay_id?: string;
}

interface QueryOrderParams {
    order_id: number;
    created_at: number;
}

interface QueryOrderResponse {
    return_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    result_code?: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg: string;
    appid?: string;
    mch_id?: string;
    sub_appid?: string;
    nonce_str?: string;
    openid?: string;
    is_subscribe?: string;
    sub_openid?: string;
    sub_is_subscribe?: string;
    trade_type?: string;
    trade_state?: string;
    bank_type?: string;
    total_fee?: number;
    settlement_total_fee?: number;
    cash_fee?: number;
    cash_fee_type?: string;
    coupon_fee?: number;
    coupon_count?: number;
    transaction_id?: string;
    out_trade_no?: string;
    attach?: string;
    time_end?: string;
    trade_state_desc?: string;
}

interface CloseOrderParams {
    order_id: number;
    created_at: number;
}

interface CloseOrderResponse {
    return_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    result_code?: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg: string;
    appid?: string;
    mch_id?: string;
    sub_appid?: string;
    nonce_str?: string;
    sign?: string;
}

interface RefundParams {
    order_id: number;
    order_item_id: number;
    created_at: number;
    total_fee: number;
    refund_fee: number;
}

interface RefundResponse {
    return_code?: typeof PAY_SUCCESS | typeof PAY_FAIL;
    result_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg?: string;
    appid?: string;
    mch_id?: string;
    sub_appid?: string;
    nonce_str?: string;
    sign?: string;
    transaction_id?: string;
    out_trade_no?: string;
    out_refund_no?: string;
    refund_id?: string;
    refund_fee?: number;
    settlement_refund_fee?: number;
    total_fee?: number;
    settlement_total_fee?: number;
    fee_type?: string;
    cash_fee?: number;
    cash_refund_fee?: number;
    coupon_refund_fee?: number;
    coupon_refund_count?: number;
}

interface RefundQueryParams {
    order_id: number;
    order_item_id: number;
    created_at: number;
}

interface RefundQueryItemResponse {
    out_refund_no: string;
    refund_id: string;
    refund_fee: number;
    refund_status: 'SUCCESS' | 'REFUNDCLOSE' | 'PROCESSING' | 'CHANGE';
    refund_account: string;
    refund_recv_accout: string;
    refund_success_time: string;
}

interface RefundQueryResponse {
    return_code: typeof PAY_SUCCESS | typeof PAY_FAIL;
    result_code?: typeof PAY_SUCCESS | typeof PAY_FAIL;
    return_msg: string;
    appid?: string;
    mch_id?: string;
    sub_appid?: string;
    nonce_str?: string;
    sign?: string;
    transaction_id?: string;
    out_trade_no?: string;
    total_fee?: number;
    refund_count?: number;
    items?: RefundQueryItemResponse[];
}

interface DownloadBillParams {
    bill_date: number; // 8位日期
    bill_type: 'ALL' | 'SUCCESS' | 'REFUND' | 'RECHARGE_REFUND';
}

export function attachDecode(attach: string): number {
    return parseInt(attach, 16);
}

export function attachEncode(id: number): string {
    return id.toString(16);
}

async function fetching(url: string, data: wechatService.XmlData, cert = false) {
    const xml = wechatService.buildXML(data);
    const axiosConfig = {
        headers: {
            'content-type': 'text/xml'
        }
    };

    if (config.debug) {
        console.log(xml);
    }

    if (cert) {
        axiosConfig['httpsAgent'] = new https.Agent({
            pfx: fs.readFileSync(config.wechat.pay.certPath),
            passphrase: config.wechat.pay.mch_id
        });
    }

    const res = await axios.post(url, xml, axiosConfig);

    return await wechatService.parseXML(res.data);
}

export function getNonceStr(order_id: number): string {
    return utils.crypto.md5(`${config.wechat.pay.mch_id}-${order_id}`);
}

export function verifyNonceStr(order_id: number, nonce_str: string): boolean {
    return nonce_str === getNonceStr(order_id);
}

export async function getKey(order_id: number): Promise<string> {
    if (config.debug) {
        const sandboxData = {
            mch_id: config.wechat.pay.mch_id,
            nonce_str: getNonceStr(order_id)
        };

        const sandboxSignArr = [];

        Object.keys(sandboxData)
            .sort()
            .forEach(key => {
                sandboxSignArr.push(`${key}=${sandboxData[key]}`);
            });

        return (
            await fetching('https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey', {
                ...sandboxData,
                sign: utils.crypto.md5(`${sandboxSignArr.join('&')}&key=${config.wechat.pay.key}`, true)
            })
        ).sandbox_signkey;
    }

    return config.wechat.pay.key;
}

export async function getSign(data: wechatService.XmlData, order_id: number): Promise<string> {
    const signKey = await getKey(order_id);

    const signArr = [];

    Object.keys(data)
        .sort()
        .forEach(key => {
            signArr.push(`${key}=${data[key]}`);
        });

    return utils.crypto.md5(`${signArr.join('&')}&key=${signKey}`, true);
}

export function tradeNo(created_at: number, order_id: number): string {
    return `${moment(created_at).format('YYYYMMDD')}${order_id}`;
}

export function tradeNoToId(no: string): number {
    return parseInt(no.substring(8), 10);
}

// 测试用例1 订单金额1.01元 用户支付成功
export async function unifiedOrder({
    community_name,
    goods,
    order_id,
    created_at,
    total_fee,
    openid
}: UnifiedOrderParams): Promise<UnifiedOrderResponse> {
    const data = {
        appid: config.wechat.ump.appid,
        mch_id: config.wechat.pay.mch_id,
        nonce_str: getNonceStr(order_id),
        sign_type: 'MD5',
        body: `${community_name}-物业费`,
        detail: `${JSON.stringify({ goods_detail: goods })}`,
        attach: attachEncode(order_id),
        out_trade_no: tradeNo(created_at, order_id),
        total_fee: config.debug ? 101 : total_fee,
        spbill_create_ip: await v4(),
        time_start: moment(created_at).format('YYYYMMDDHHmmss'),
        time_expire: moment(created_at + config.wechat.pay.payExpire).format('YYYYMMDDHHmmss'),
        notify_url: `${config.debug ? config.wechat.pay.devHost : config.wechat.pay.prodHost}/notify/wechat/pay`,
        trade_type: 'JSAPI',
        profit_sharing: 'N',
        openid
    };

    return <UnifiedOrderResponse>(
        await fetching(`https://api.mch.weixin.qq.com${config.debug ? '/sandboxnew' : ''}/pay/unifiedorder`, {
            ...data,
            sign: await getSign(data, order_id)
        })
    );
}

export async function queryOrder({ order_id, created_at }: QueryOrderParams): Promise<QueryOrderResponse> {
    const data = {
        appid: config.wechat.ump.appid,
        mch_id: config.wechat.pay.mch_id,
        out_trade_no: tradeNo(created_at, order_id),
        nonce_str: getNonceStr(order_id),
        sign_type: 'MD5'
    };

    return <QueryOrderResponse>(
        await fetching(`https://api.mch.weixin.qq.com${config.debug ? '/sandboxnew' : ''}/pay/orderquery`, {
            ...data,
            sign: await getSign(data, order_id)
        })
    );
}

export async function closeOrder({ order_id, created_at }: CloseOrderParams): Promise<CloseOrderResponse> {
    const data = {
        appid: config.wechat.ump.appid,
        mch_id: config.wechat.pay.mch_id,
        out_trade_no: tradeNo(created_at, order_id),
        nonce_str: getNonceStr(order_id),
        sign_type: 'MD5'
    };

    return <CloseOrderResponse>(
        await fetching(`https://api.mch.weixin.qq.com${config.debug ? '/sandboxnew' : ''}/pay/closeorder`, {
            ...data,
            sign: await getSign(data, order_id)
        })
    );
}

export async function refund({
    order_id,
    order_item_id,
    created_at,
    total_fee,
    refund_fee
}: RefundParams): Promise<RefundResponse> {
    const data = {
        appid: config.wechat.ump.appid,
        mch_id: config.wechat.pay.mch_id,
        out_trade_no: tradeNo(created_at, order_id),
        out_refund_no: tradeNo(created_at, order_item_id),
        total_fee: config.debug ? 101 : total_fee,
        refund_fee,
        nonce_str: getNonceStr(order_id),
        sign_type: 'MD5',
        notify_url: `${config.debug ? config.wechat.pay.devHost : config.wechat.pay.prodHost}/notify/wechat/refund`
    };

    return <RefundResponse>await fetching(
        `https://api.mch.weixin.qq.com${config.debug ? '/sandboxnew' : ''}/secapi/pay/refund`,
        {
            ...data,
            sign: await getSign(data, order_id)
        },
        true
    );
}

export async function refundQuery({
    order_id,
    order_item_id,
    created_at
}: RefundQueryParams): Promise<RefundQueryResponse> {
    const data = {
        appid: config.wechat.ump.appid,
        mch_id: config.wechat.pay.mch_id,
        out_trade_no: tradeNo(created_at, order_id),
        out_refund_no: tradeNo(created_at, order_item_id),
        nonce_str: getNonceStr(order_id),
        sign_type: 'MD5',
        notify_url: `${config.debug ? config.wechat.pay.devHost : config.wechat.pay.prodHost}/notify/wechat/refund`
    };

    const res = await fetching(
        `https://api.mch.weixin.qq.com${config.debug ? '/sandboxnew' : ''}/pay/refundquery`,
        {
            ...data,
            sign: await getSign(data, order_id)
        },
        true
    );

    if (res.return_code === PAY_FAIL) {
        return {
            return_code: res.return_code,
            return_msg: res.return_msg
        };
    }

    const items = [];

    for (let i = 0; i < res.refund_count; i++) {
        items.push({
            out_refund_no: res[`out_refund_no_${i}`],
            refund_id: res[`refund_id_${i}`],
            refund_fee: res[`refund_fee_${i}`],
            refund_status: res[`refund_status_${i}`],
            refund_account: res[`refund_account_${i}`],
            refund_recv_accout: res[`refund_recv_accout_${i}`],
            refund_success_time: res[`refund_success_time_${i}`]
        });
    }

    return {
        return_code: res.return_code,
        result_code: res.result_code,
        return_msg: res.return_msg,
        appid: res.appid,
        mch_id: res.mch_id,
        sub_appid: res.sub_appid,
        nonce_str: res.nonce_str,
        sign: res.sign,
        transaction_id: res.transaction_id,
        out_trade_no: res.out_trade_no,
        total_fee: res.total_fee,
        refund_count: res.refund_count,
        items
    };
}

export async function downloadBill({ bill_date, bill_type }: DownloadBillParams) {
    const data = {
        appid: config.wechat.ump.appid,
        mch_id: config.wechat.pay.mch_id,
        nonce_str: getNonceStr(bill_date),
        bill_date: bill_date.toString(),
        bill_type,
        sign_type: 'MD5',
        tar_type: 'GZIP'
    };

    return <RefundQueryResponse>await fetching(
        `https://api.mch.weixin.qq.com${config.debug ? '/sandboxnew' : ''}/pay/downloadbill`,
        {
            ...data,
            sign: await getSign(data, bill_date)
        },
        true
    );
}
