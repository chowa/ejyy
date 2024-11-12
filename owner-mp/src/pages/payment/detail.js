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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

let timer = null;

CwPage({
    data: {
        id: null,
        payNow: false,
        fetching: true,
        info: {},
        status: 'needpay',
        curStamp: Date.now(),
        refunding_fee: 0,
        refunded_fee: 0,
        refund_apply_at: null,
        refund_at: null
    },
    onLoad(opts) {
        this.setData(
            {
                id: parseInt(opts.id, 10),
                payNow: opts.paynow ? true : false
            },
            () => {
                this.loadData();
            }
        );
    },
    onHide() {
        if (timer !== null) {
            clearInterval(timer);
        }
    },
    loadData() {
        const { id, payNow } = this.data;

        return utils
            .request({
                url: `/payment/detail/${id}`,
                method: 'get'
            })
            .then(res => {
                let status = '';
                if (res.data.detail.cancel) {
                    status = 'cancel';
                } else if (res.data.detail.refunding && !res.data.detail.refunded) {
                    status = 'refunding';
                } else if (res.data.detail.refunding && res.data.detail.refunded) {
                    status = 'refunded';
                } else if (res.data.detail.paid) {
                    status = 'paid';
                } else if (Date.now() - res.data.payExpire >= res.data.detail.created_at) {
                    status = 'expired';
                } else {
                    status = 'needpay';

                    timer = setInterval(() => {
                        if (Date.now() - res.data.payExpire >= res.data.detail.created_at) {
                            this.setData({
                                status: 'expired'
                            });
                            timer = null;
                            return clearInterval(timer);
                        }
                        this.setData({
                            curStamp: Date.now()
                        });
                    }, 1000);
                }

                let refunding_fee = 0;
                let refunded_fee = 0;
                let refund_apply_at = null;
                let refund_at = null;

                if (status === 'refunding' || status === 'refunded') {
                    res.data.items.forEach(item => {
                        if (item.refund_apply_at && !item.refund) {
                            refund_apply_at = item.refund_apply_at;
                            refunding_fee += item.fee;
                        } else if (item.refund_apply_at && item.refund) {
                            refund_at = item.refund_at;
                            refunded_fee += item.fee;
                        }
                    });
                }

                this.setData(
                    {
                        fetching: false,
                        info: res.data,
                        status,
                        curStamp: Date.now(),
                        refunding_fee,
                        refunded_fee,
                        refund_apply_at,
                        refund_at
                    },
                    () => {
                        if (payNow && status === 'needpay') {
                            this.doPay();
                        }
                    }
                );
            });
    },
    doPay() {
        const { id } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '交易中…'
        });

        utils
            .request({
                url: `/payment/pay/${id}`,
                method: 'get'
            })
            .then(
                res => {
                    $toast.clear();

                    wx.requestPayment({
                        ...res.data,
                        success: res => {
                            wx.redirectTo({ url: `/pages/payment/result?id=${id}` });
                        }
                    });
                },
                res => {
                    $toast.clear();
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onPullDownRefresh() {
        this.loadData().then(() => {
            wx.stopPullDownRefresh();
        });
    }
});
