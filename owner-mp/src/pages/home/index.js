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
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        navBarClass: 'nav-bar',
        unread_amount: 0,
        virus: {},
        fetching: true,
        topic: [],
        notice: [],
        showOaComponent: true,
        showRecommand: false
    },
    onLoad() {
        if (!wx.getStorageSync('RECOMMAND_DESKTOP')) {
            this.setData({ showRecommand: true });
        }

        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
    },
    onShow() {
        if (typeof this.getTabBar === 'function') {
            this.getTabBar().setData({
                activeTab: 0
            });
        }
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    loadData() {
        if (!this.data.communityInfo.current) {
            return Promise.reject();
        }
        return utils
            .request({
                url: `/home/main/${this.data.communityInfo.current.community_id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    unread_amount: res.data.unread_amount,
                    virus: res.data.virus,
                    topic: res.data.topic,
                    notice: res.data.notice,
                    fetching: false
                });
            });
    },
    onPageScroll(e) {
        const { scrollTop } = e;
        const navBarClass = ['nav-bar'];

        if (scrollTop > 0 && scrollTop < 270) {
            navBarClass.push('half-opacity');
        } else if (scrollTop >= 270) {
            navBarClass.push('full-opacity');
        }

        this.setData({ navBarClass: navBarClass.join(' ') });
    },
    onPullDownRefresh() {
        this.loadData().then(() => {
            wx.stopPullDownRefresh();
        });
    },
    connectService() {
        const { communityInfo } = this.data;

        wx.makePhoneCall({
            phoneNumber: communityInfo.current.phone,
            fail: () => {}
        });
    },
    onOALoadFail() {
        this.setData({
            showOaComponent: false
        });
    },
    hideRecommand() {
        wx.setStorageSync('RECOMMAND_DESKTOP', 1);
        this.setData({ showRecommand: false });
    }
});
