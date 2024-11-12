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

CwPage({
    data: {
        activeTabIndex: 0,
        unread_fetching: true,
        readed_fetching: true,
        unread_page_num: 1,
        readed_page_num: 1,
        unread_page_amount: 0,
        readed_page_amount: 0,
        unread_list: [],
        readed_list: []
    },
    onLoad() {
        this.setData(
            {
                page_size: Math.ceil(this.data.systemInfo.windowHeight / 178)
            },
            () => {
                this.loadUnreadData(1);
                this.loadReadedData(1);
            }
        );
    },
    loadUnreadData(page_num) {
        if (this.data.unread_fetching && page_num > 1) {
            return Promise.reject();
        }

        this.setData({
            unread_fetching: true,
            unread_list: page_num === 1 ? [] : this.data.unread_list
        });

        return utils
            .request({
                url: '/notice/unread',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size
                }
            })
            .then(res => {
                this.setData({
                    unread_fetching: false,
                    unread_page_num: res.data.page_num,
                    unread_page_amount: res.data.page_amount,
                    unread_list: page_num === 1 ? res.data.list : [].concat(this.data.unread_list, res.data.list)
                });
            });
    },
    loadReadedData(page_num) {
        if (this.data.readed_fetching && page_num > 1) {
            return Promise.reject();
        }

        this.setData({
            readed_fetching: true,
            readed_list: page_num === 1 ? [] : this.data.readed_list
        });

        return utils
            .request({
                url: '/notice/readed',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size
                }
            })
            .then(res => {
                this.setData({
                    readed_fetching: false,
                    readed_page_num: res.data.page_num,
                    readed_page_amount: res.data.page_amount,
                    readed_list: page_num === 1 ? res.data.list : [].concat(this.data.readed_list, res.data.list)
                });
            });
    },
    onTabChange(e) {
        this.setData({ activeTabIndex: e.detail.index });
    },
    // 下拉刷新
    onReachBottom() {
        const { activeTabIndex, unread_page_num, unread_page_amount, readed_page_num, readed_page_amount } = this.data;

        if (activeTabIndex === 0) {
            if (unread_page_num < unread_page_amount) {
                this.loadUnreadData(unread_page_num + 1);
            }
        } else {
            if (readed_page_num < readed_page_amount) {
                this.loadReadedData(readed_page_num + 1);
            }
        }
    },
    onPullDownRefresh() {
        Promise.all([this.loadUnreadData(1), this.loadReadedData(1)]).then(() => {
            wx.stopPullDownRefresh();
        });
    }
});
