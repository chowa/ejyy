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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        categoryOptions: [
            { text: '全部服务', value: '家政' },
            { text: '保洁钟点工', value: '保洁钟点工' },
            { text: '开锁', value: '开锁' },
            { text: '送水', value: '送水' },
            { text: '家电维修', value: '家电维修' },
            { text: '管道疏通打孔', value: '管道疏通打孔' },
            { text: '搬家', value: '搬家' },
            { text: '月嫂保姆', value: '月嫂保姆' },
            { text: '其它家政', value: '其它家政' }
        ],
        category: '家政',
        radiusOptions: [
            { text: '2公里内', value: 2000 },
            { text: '5公里内', value: 5000 },
            { text: '10公里内', value: 10000 },
            { text: '15公里内', value: 15000 }
        ],
        radius: 5000,
        fetching: true,
        page_size: 5,
        page_num: 1,
        page_amount: 1,
        list: []
    },
    onLoad() {
        this.setData({
            page_size: Math.ceil(this.data.systemInfo.windowHeight / 186)
        });
    },
    onShow() {
        if (typeof this.getTabBar === 'function') {
            this.getTabBar().setData({
                activeTab: 1
            });
        }
    },
    onGlobalDataUpdate() {
        this.loadData(1);
    },
    onCategoryChange(e) {
        this.setData(
            {
                category: e.detail
            },
            () => {
                this.loadData(1);
            }
        );
    },
    onRadiuChange(e) {
        this.setData(
            {
                radius: e.detail
            },
            () => {
                this.loadData(1);
            }
        );
    },
    loadData(page_num) {
        if ((this.data.fetching && page_num > 1) || !this.data.communityInfo.current) {
            return Promise.reject();
        }

        this.setData({
            fetching: true,
            list: page_num === 1 ? [] : this.data.list
        });

        return utils
            .request({
                url: '/service/list',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.communityInfo.current.community_id,
                    category: this.data.category,
                    radius: this.data.radius
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
    openMap(e) {
        const { location, title } = e.currentTarget.dataset;

        wx.openLocation({
            latitude: location.lat,
            longitude: location.lng,
            scale: 18,
            title
        });
    },
    makeCall(e) {
        const { tel } = e.currentTarget.dataset;

        wx.makePhoneCall({
            phoneNumber: tel,
            fail: () => {}
        });
    }
});
