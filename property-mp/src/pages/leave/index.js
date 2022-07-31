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
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        activeTabIndex: 0,
        fetching: true,
        page_size: 5,
        page_num: 1,
        page_amount: 0,
        list: [],
        now: Date.now(),
        show: false,
        reason: '',
        begin_date: '',
        total: '',
        submiting: false
    },
    validator: {
        formFields: ['begin_date', 'total', 'reason'],
        formRule: {
            begin_date: [{ required: true, type: 'number', message: '请选择请假时间' }],
            total: [
                { required: true, message: '请选择请假天数' },
                { required: true, pattern: /^\d+(\.\d+)?$/, message: '请选择正确的请假天数' }
            ],
            reason: [
                { required: true, message: '请输入请假原因' },
                { max: 128, message: '请假原因不能超过128个字' }
            ]
        }
    },
    onLoad() {
        this.setData({
            page_size: Math.ceil(this.data.systemInfo.windowHeight / 160)
        });
    },
    onGlobalDataUpdate() {
        this.loadData(1);
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
                url: '/leave/my',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    page_num: res.data.page_num,
                    page_amount: res.data.page_amount,
                    list: page_num === 1 ? res.data.list : [].concat(this.data.list, res.data.list)
                });
            });
    },
    onTabChange(e) {
        this.setData({ activeTabIndex: e.detail.index });
    },
    // 下拉刷新
    onReachBottom() {
        const { activeTabIndex, page_num, page_amount } = this.data;

        if (activeTabIndex === 1) {
            if (page_num < page_amount) {
                this.loadData(page_num + 1);
            }
        }
    },
    onPullDownRefresh() {
        this.loadData(1).then(() => {
            wx.stopPullDownRefresh();
        });
    },
    showCalendar() {
        this.setData({ show: true });
    },
    hideCalendar() {
        this.setData({ show: false });
    },
    onDateChange(e) {
        this.setData({
            begin_date: +e.detail,
            show: false
        });
    },
    submit() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({ submiting: true });

            utils
                .request({
                    url: '/leave/create',
                    method: 'post',
                    data: {
                        reason: this.data.reason,
                        begin_date: this.data.begin_date,
                        total: this.data.total,
                        community_id: this.data.postInfo.default_community_id
                    }
                })
                .then(
                    res => {
                        this.setData({
                            reason: '',
                            begin_date: '',
                            total: '',
                            submiting: false
                        });
                        $toast.clear();
                        wx.navigateTo({ url: `/pages/leave/detail?id=${res.data.id}` });
                    },
                    res => {
                        this.setData({ submiting: false });
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                    }
                );
        });
    }
});
