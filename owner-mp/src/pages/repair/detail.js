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
        id: null,
        fetching: true,
        steps: [{ text: '业主报修' }, { text: '工单分配' }, { text: '工单确认' }, { text: '工单完成' }],
        detail: {},
        rate: 5,
        rate_content: '',
        submiting: false,
        urging: false
    },
    onLoad(opts) {
        // opts.id = 1;

        this.setData(
            {
                id: opts.id
            },
            () => {
                this.loadData();
            }
        );
    },
    loadData() {
        utils
            .request({
                url: `/repair/detail/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    showRepairImg(e) {
        const { index } = e.currentTarget.dataset;

        wx.previewImage({
            current: index,
            urls: this.data.detail.repair_imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    },
    showDisposeImg(e) {
        const { index } = e.currentTarget.dataset;

        wx.previewImage({
            current: index,
            urls: this.data.detail.dispose_imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    },
    makePhone(e) {
        const { phone } = e.currentTarget.dataset;

        wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {}
        });
    },
    onRateChange(e) {
        this.setData({
            rate: e.detail
        });
    },
    rateSubmit() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        this.setData({
            submiting: true
        });

        utils
            .request({
                url: `/repair/rate/${this.data.detail.id}`,
                method: 'post',
                data: {
                    rate: this.data.rate,
                    rate_content: this.data.rate_content
                }
            })
            .then(
                () => {
                    $toast.clear();
                    $notify({
                        type: 'success',
                        message: '评价成功'
                    });

                    this.setData({
                        detail: {
                            ...this.data.detail,
                            rate: this.data.rate,
                            rate_content: this.data.rate_content,
                            rated_at: Date.now()
                        },
                        submiting: false
                    });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                    this.setData({
                        submiting: false
                    });
                }
            );
    },
    doUrge() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '催促中…'
        });

        this.setData({
            urging: true
        });

        utils
            .request({
                url: `/repair/urge/${this.data.detail.id}`,
                method: 'get'
            })
            .then(
                res => {
                    $toast.clear();
                    $notify({
                        type: 'success',
                        message: res.message
                    });

                    this.setData({
                        urging: false
                    });
                },
                res => {
                    $toast.clear();
                    $notify({
                        type: 'danger',
                        message: res.message
                    });

                    this.setData({
                        urging: false
                    });
                }
            );
    }
});
