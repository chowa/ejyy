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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import $dialog from '../../components/dialog/dialog';

let timer = null;

CwPage({
    data: {
        page_num: 1,
        page_amount: 0,
        list: [],
        fetching: true,
        curStamp: Date.now(),
        payExpire: 0
    },
    onLoad() {
        this.setData(
            {
                page_size: Math.ceil(this.data.systemInfo.windowHeight / 180)
            },
            () => {
                this.loadData(1);
            }
        );
    },
    onShow() {
        timer = setInterval(() => {
            this.setData({
                curStamp: Date.now()
            });
        }, 1000);
    },
    onHide() {
        clearInterval(timer);
    },
    loadData(page_num) {
        if (this.data.fetching && page_num > 1) {
            return Promise.reject();
        }

        this.setData({
            fetching: true,
            list: page_num === 1 ? [] : this.data.list
        });

        return utils
            .request({
                url: '/payment/list',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    page_num: res.data.page_num,
                    page_amount: res.data.page_amount,
                    list: page_num === 1 ? res.data.list : [].concat(this.data.list, res.data.list),
                    payExpire: res.data.payExpire
                });
            });
    },
    // 下拉刷新
    onReachBottom() {
        const { page_num, page_amount } = this.data;

        if (page_num < page_amount) {
            this.loadData(page_num + 1);
        }
    },
    onPullDownRefresh() {
        this.loadData(1).then(() => {
            wx.stopPullDownRefresh();
        });
    },
    cancelOrder(e) {
        const { id } = e.currentTarget.dataset;
        const { list } = this.data;

        $dialog
            .confirm({
                message: '确认要取消订单吗？'
            })
            .then(() => {
                $toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: '提交中…'
                });

                utils
                    .request({
                        url: `/payment/cancel/${id}`,
                        method: 'get'
                    })
                    .then(
                        res => {
                            $toast.clear();
                            $notify({
                                type: 'success',
                                message: '订单取消成功'
                            });
                            const index = list.findIndex(item => item.order_id === id);

                            list[index].cancel = 1;

                            this.setData({ list });
                        },
                        res => {
                            $toast.clear();
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                        }
                    );
            })
            .catch(() => {});
    },
    payOrder(e) {
        const { id } = e.currentTarget.dataset;

        wx.navigateTo({ url: `/pages/payment/detail?id=${id}&paynow=1` });
    }
});
