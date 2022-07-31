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
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import $dialog from '../../components/dialog/dialog';
import utils from '../../utils/index';

CwPage({
    data: {
        showNotice: false
    },
    onShow() {
        if (this.data.communityInfo.list.length === 0 && wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
    },
    getCommunityInfo() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '信息获取中…'
        });

        utils
            .request({
                url: '/community/binding_by_self',
                method: 'get'
            })
            .then(
                res => this.bindSuccesHandler(res),
                res => this.bindFailHandler(res)
            );
    },
    bindByProperty() {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            success: res => {
                $toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: '识别中…'
                });

                utils
                    .request({
                        url: '/community/binding_by_property',
                        method: 'post',
                        data: {
                            qrcontent: res.result
                        }
                    })
                    .then(
                        res => this.bindSuccesHandler(res),
                        res => this.bindFailHandler(res)
                    );
            },
            fail: () => {
                $notify({
                    type: 'danger',
                    message: '非法二维码'
                });
            }
        });
    },
    bindByFamily() {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            success: res => {
                $toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: '识别中…'
                });

                utils
                    .request({
                        url: '/community/binding_by_family',
                        method: 'post',
                        data: {
                            qrcontent: res.result
                        }
                    })
                    .then(
                        res => this.bindSuccesHandler(res),
                        res => this.bindFailHandler(res)
                    );
            },
            fail: () => {
                $notify({
                    type: 'danger',
                    message: '非法二维码'
                });
            }
        });
    },
    slefAppend() {
        wx.navigateTo({ url: '/pages/community/append' });
    },
    bindSuccesHandler(res) {
        $toast.clear();

        this.bridge.updateData({
            communityInfo: res.data.communityInfo
        });

        $dialog
            .alert({
                title: '操作成功',
                message: '住宅信息关联成功'
            })
            .then(() => {
                const pages = getCurrentPages();

                if (pages.length >= 2 && pages[pages.length - 2].route === 'pages/community/index') {
                    wx.navigateBack({ delta: 1 });
                } else {
                    wx.switchTab({ url: '/pages/home/index' });
                }
            });
    },
    bindFailHandler(res) {
        $toast.clear();
        $notify({
            type: 'danger',
            message: res.message
        });
        this.setData({ showNotice: true });
    }
});
