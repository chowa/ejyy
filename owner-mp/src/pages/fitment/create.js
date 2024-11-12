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
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

let timer = null;

CwPage({
    data: {
        fetching: true,
        list: [],
        showPopup: false,
        applyId: null,
        submiting: false,
        countdown: null
    },
    onShow() {
        if (this.data.showPopup && this.data.countDown !== null) {
            this.countDown();
        }
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    onHide() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    },
    loadData() {
        utils
            .request({
                url: `/fitment/unfinished`,
                method: 'post',
                data: {
                    community_id: this.data.communityInfo.current.community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    list: res.data.list
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    countDown() {
        timer = setTimeout(() => {
            if (this.data.countdown === 0) {
                clearTimeout(timer);
                timer = null;
            } else {
                this.setData(
                    {
                        countdown: this.data.countdown - 1
                    },
                    () => {
                        this.countDown();
                    }
                );
            }
        }, 1000);
    },
    showNotice(e) {
        this.setData(
            {
                applyId: e.currentTarget.dataset.id,
                showPopup: true,
                countdown: 30
            },
            () => {
                this.countDown();
            }
        );
    },
    hideNotice() {
        this.setData({
            applyId: null,
            showPopup: false,
            countdown: null
        });

        clearTimeout(timer);
        timer = null;
    },
    submit() {
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
                url: '/fitment/create',
                method: 'post',
                data: {
                    building_id: this.data.applyId,
                    community_id: this.data.communityInfo.current.community_id
                }
            })
            .then(
                res => {
                    this.setData({
                        submiting: false
                    });

                    $toast.clear();

                    wx.redirectTo({
                        url: `/pages/fitment/detail?id=${res.data.id}`
                    });
                },
                res => {
                    this.setData({
                        submiting: false
                    });
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                }
            );
    }
});
