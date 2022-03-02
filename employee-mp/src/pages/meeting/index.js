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

CwPage({
    data: {
        activeTabIndex: 0,
        my_fetching: true,
        participant_fetching: true,
        my_page_num: 1,
        participant_page_num: 1,
        my_page_amount: 0,
        participant_page_amount: 0,
        my_list: [],
        participant_list: [],
        page_size: 5,
        now: Date.now()
    },
    onLoad() {
        this.setData({
            page_size: Math.ceil(this.data.systemInfo.windowHeight / 220)
        });
    },
    onGlobalDataUpdate() {
        this.loadMyData(1);
        this.loadSelfData(1);
    },
    loadMyData(page_num) {
        if (this.data.my_fetching && page_num > 1) {
            return Promise.reject();
        }

        this.setData({
            my_fetching: true,
            my_list: page_num === 1 ? [] : this.data.my_list
        });

        return utils
            .request({
                url: '/meeting/my',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    my_fetching: false,
                    my_page_num: res.data.page_num,
                    my_page_amount: res.data.page_amount,
                    my_list: page_num === 1 ? res.data.list : [].concat(this.data.my_list, res.data.list)
                });
            });
    },
    loadSelfData(page_num) {
        if (this.data.participant_fetching && page_num > 1) {
            return Promise.reject();
        }

        this.setData({
            participant_fetching: true,
            participant_list: page_num === 1 ? [] : this.data.participant_list
        });

        return utils
            .request({
                url: '/meeting/participant',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    participant_fetching: false,
                    participant_page_num: res.data.page_num,
                    participant_page_amount: res.data.page_amount,
                    participant_list:
                        page_num === 1 ? res.data.list : [].concat(this.data.participant_list, res.data.list)
                });
            });
    },
    onTabChange(e) {
        this.setData({ activeTabIndex: e.detail.index });
    },
    // 下拉刷新
    onReachBottom() {
        const {
            activeTabIndex,
            my_page_num,
            my_page_amount,
            participant_page_num,
            participant_page_amount
        } = this.data;

        if (activeTabIndex === 0) {
            if (my_page_num < my_page_amount) {
                this.loadMyData(my_page_num + 1);
            }
        } else {
            if (participant_page_num < participant_page_amount) {
                this.loadSelfData(participant_page_num + 1);
            }
        }
    },
    onPullDownRefresh() {
        Promise.all([this.loadMyData(1), this.loadSelfData(1)]).then(() => {
            wx.stopPullDownRefresh();
        });
    }
});
