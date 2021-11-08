/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        activeTabIndex: 0,
        fetching: true,
        page_size: 5,
        page_num: 1,
        page_amount: 0,
        list: [],
        now: Date.now(),
        show: false,
        reason: '',
        range: [],
        total: 0,
        items: [],
        submiting: false,
        activeCollapse: 0
    },
    validator: {
        formFields: ['range', 'reason', 'items'],
        formRule: {
            range: [{ required: true, type: 'array', message: '请选择报销时间' }],
            items: [{ required: true, type: 'array', message: '请添加报销项目' }],
            reason: [
                { required: true, message: '请输入报销原因' },
                { max: 128, message: '报销原因不能超过128个字' }
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
                url: '/refound/my',
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
            range: [+e.detail[0], +e.detail[1]],
            show: false
        });
    },
    appendItem() {
        const item = {
            reason: '',
            code: '',
            num: '',
            date: '',
            attachment_url: '',
            fee: ''
        };

        wx.navigateTo({ url: `/pages/refound/item?info=${JSON.stringify(item)}` });
    },
    onCollapseChange(e) {
        this.setData({ activeCollapse: e.detail });
    },
    showImg(e) {
        const { src } = e.currentTarget.dataset;

        wx.previewImage({
            current: 0,
            urls: [src]
        });
    },
    computedTotal() {
        let total = 0;

        this.data.items.forEach(({ fee }) => {
            total += parseFloat(fee, 10);
        });

        this.setData({ total });
    },
    remove(e) {
        const { index } = e.currentTarget.dataset;
        const { items } = this.data;

        if (items.length === 1) {
            return $notify({
                type: 'danger',
                message: '至少要有一个报销项目'
            });
        }

        items.splice(index, 1);

        this.setData({ items });
    },
    update(e) {
        const { index } = e.currentTarget.dataset;

        wx.navigateTo({ url: `/pages/refound/item?info=${JSON.stringify(this.data.items[index])}&index=${index}` });
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
                    url: '/refound/create',
                    method: 'post',
                    data: {
                        reason: this.data.reason,
                        begin_date: this.data.range[0],
                        finish_date: this.data.range[1],
                        total: this.data.total,
                        community_id: this.data.postInfo.default_community_id,
                        items: this.data.items.map(item => {
                            return {
                                ...item,
                                fee: parseFloat(item.fee, 10)
                            };
                        })
                    }
                })
                .then(
                    res => {
                        this.setData({
                            reason: '',
                            range: [],
                            total: 0,
                            items: [],
                            submiting: false
                        });
                        $toast.clear();
                        wx.navigateTo({ url: `/pages/refound/detail?id=${res.data.id}` });
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
