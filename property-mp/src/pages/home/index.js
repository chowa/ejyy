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
import { ROLES } from '../../constants/role';

CwPage({
    data: {
        fetching: false,
        showAction: false,
        actions: [],
        ROLES,
        workInfo: {},
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
    onGlobalDataUpdate() {
        this.setData({
            actions: this.data.postInfo.community_list
        });

        this.getDetail();
    },
    changeCommunity() {
        this.setData({ showAction: true });
    },
    onCloseAction() {
        this.setData({ showAction: false });
    },
    onSelectAction(e) {
        if (e.detail.community_id === this.data.postInfo.default_community_id) {
            return;
        }

        $toast.loading({
            duration: 0,
            message: '设置中…',
            forbidClick: true
        });

        utils
            .request({
                url: '/community/default',
                method: 'post',
                data: {
                    community_id: e.detail.community_id
                }
            })
            .then(res => {
                this.bridge.updateData({
                    postInfo: {
                        ...this.data.postInfo,
                        default_community_id: e.detail.community_id
                    }
                });

                $toast.clear();
            });
    },
    getDetail() {
        if (this.data.fetching || !this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({ fetching: true });

        return utils
            .request({
                url: '/statistic/work',
                method: 'post',
                data: {
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(
                res => {
                    this.setData({
                        fetching: false,
                        workInfo: res.data
                    });
                },
                res => {
                    this.setData({
                        fetching: false
                    });

                    $notify({
                        customNavBar: true,
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onPullDownRefresh() {
        this.getDetail().then(() => {
            wx.stopPullDownRefresh();
        });
    },
    // 业主认证
    owerScan() {
        this.owerCardOperate(true);
    },
    // 疫情防控
    epidemicScan() {
        this.owerCardOperate(false);
    },
    // 访客登记
    vistorScan() {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            fail: () => {
                $notify({
                    customNavBar: true,
                    message: '访客二维码扫描失败，请重试',
                    type: 'danger'
                });
            },
            success: res => {
                const data = {
                    community_id: this.data.postInfo.default_community_id,
                    uid: res.result
                };

                $toast.loading({
                    duration: 0,
                    message: '认证中…',
                    forbidClick: true
                });

                utils
                    .request({
                        url: '/vistor/scan',
                        method: 'post',
                        data
                    })
                    .then(
                        res => {
                            $toast.clear();
                            wx.navigateTo({ url: `/pages/vistor/index?id=${res.data.id}` });
                        },
                        res => {
                            $notify({
                                customNavBar: true,
                                message: res.message,
                                type: 'danger'
                            });
                            $toast.clear();
                        }
                    );
            }
        });
    },
    owerCardOperate(display) {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            fail: () => {
                $notify({
                    customNavBar: true,
                    message: '业主名片二维码扫描失败，请重试',
                    type: 'danger'
                });
            },
            success: res => {
                const data = {
                    uid: res.result,
                    community_id: this.data.postInfo.default_community_id
                };

                $toast.loading({
                    duration: 0,
                    message: '认证中…',
                    forbidClick: true
                });

                utils
                    .request({
                        url: '/option/card',
                        method: 'post',
                        data
                    })
                    .then(
                        res => {
                            wx.setStorageSync('OWER_INFO', JSON.stringify(res.data));

                            $toast.clear();

                            if (display) {
                                wx.navigateTo({ url: '/pages/ower/index' });
                            } else {
                                wx.navigateTo({ url: '/pages/epidemic/index' });
                            }
                        },
                        res => {
                            $notify({
                                customNavBar: true,
                                message: res.message,
                                type: 'danger'
                            });
                            $toast.clear();
                        }
                    );
            }
        });
    },
    scanMaterial() {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            fail: () => {
                $notify({
                    customNavBar: true,
                    message: '物品二维码扫描失败，请重试',
                    type: 'danger'
                });
            },
            success: res => {
                const match = res.result.match(/^ML\d{8}(\d+)$/);

                if (!match) {
                    return $notify({
                        customNavBar: true,
                        message: '非法的物品二维码',
                        type: 'danger'
                    });
                }

                wx.navigateTo({ url: `/pages/material/index?id=${match[1]}` });
            }
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
