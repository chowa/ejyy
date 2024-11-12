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
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        fetching: true,
        page_size: 5,
        page_num: 1,
        page_amount: 1,
        list: [],
        now: Date.now()
    },
    onLoad() {
        this.setData({
            page_size: Math.ceil(this.data.systemInfo.windowHeight / 240)
        });
    },
    onGlobalDataUpdate() {
        this.loadData(1);
    },
    loadData(page_num) {
        if ((this.data.fetching && page_num > 1) || !this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({
            fetching: true,
            list: page_num === 1 ? [] : this.data.list
        });

        return utils
            .request({
                url: '/mission/my',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(
                res => {
                    this.setData({
                        fetching: false,
                        page_num: res.data.page_num,
                        page_amount: res.data.page_amount,
                        list: page_num === 1 ? res.data.list : [].concat(this.data.list, res.data.list)
                    });
                },
                res => {
                    this.setData({
                        fetching: false,
                        list: []
                    });

                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
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
    goToDetail(e) {
        wx.navigateTo({ url: `/pages/mission/detail?id=${e.currentTarget.dataset.id}` });
    },
    startMission(e) {
        wx.navigateTo({ url: `/pages/mission/submit?id=${e.currentTarget.dataset.id}` });
    }
});
