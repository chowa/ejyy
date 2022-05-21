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
        remark: '',
        total: 0,
        items: [],
        submiting: false,
        activeCollapse: 0,
        options: {}
    },
    validator: {
        formFields: ['remark', 'items'],
        formRule: {
            items: [{ required: true, type: 'array', message: '请添加采购项目' }],
            remark: [
                { required: true, message: '请输入采购原因' },
                { max: 512, message: '采购原因不能超过512个字' }
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
        this.getOptions();
    },
    getOptions() {
        utils
            .request({
                url: '/purchase/option',
                method: 'post',
                data: {
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({ options: res.data });
            });
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
                url: '/purchase/my',
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
    appendItem() {
        const item = {
            material_id: '',
            supplier_id: '',
            total: '',
            fee: ''
        };

        wx.navigateTo({
            url: `/pages/purchase/item?info=${JSON.stringify(item)}&options=${JSON.stringify(this.data.options)}`
        });
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
                message: '至少要有一个采购项目'
            });
        }

        items.splice(index, 1);

        this.setData({ items });
    },
    update(e) {
        const { index } = e.currentTarget.dataset;

        wx.navigateTo({
            url: `/pages/purchase/item?info=${JSON.stringify(this.data.items[index])}&options=${JSON.stringify(
                this.data.options
            )}&index=${index}`
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
                    url: '/purchase/create',
                    method: 'post',
                    data: {
                        remark: this.data.remark,
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
                            remark: '',
                            total: 0,
                            items: [],
                            submiting: false
                        });
                        $toast.clear();
                        wx.navigateTo({ url: `/pages/purchase/detail?id=${res.data.id}` });
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
