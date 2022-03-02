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
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import * as common from '../common/common';

let timer = null;

CwPage({
    data: {
        date: '',
        dates: [],
        weeks: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        list: [],
        fetching: true,
        disabled: true,
        time: ''
    },
    onLoad() {
        const dates = [];
        const now = Date.now();

        const getDay = stamp => {
            const d = new Date(stamp);

            return {
                date: d.getDate(),
                day: d.getDay()
            };
        };

        // 向前三天
        for (let i = 3; i > 0; i--) {
            dates.push(getDay(now - i * 1000 * 24 * 60 * 60));
        }

        dates.push(getDay(now));

        for (let i = 1; i <= 3; i++) {
            dates.push(getDay(now + i * 1000 * 24 * 60 * 60));
        }

        this.setData({
            date: common.date(now, false),
            dates,
            time: common.time(now)
        });
    },
    onShow() {
        timer = setInterval(() => {
            this.setData({
                time: common.time(Date.now())
            });
        }, 1000);
    },
    onHide() {
        clearInterval(timer);
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    loadData() {
        if (!this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        return utils
            .request({
                url: '/sign/my',
                method: 'post',
                data: {
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                let disabled = true;

                if (res.data.list.length > 0 && !res.data.list[0].finish) {
                    disabled = false;
                }

                this.setData({
                    fetching: false,
                    list: res.data.list,
                    disabled
                });
            });
    },
    onPullDownRefresh() {
        this.loadData().then(() => {
            wx.stopPullDownRefresh();
        });
    },
    submit() {
        if (this.data.disabled) {
            return;
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        const getLocationAndSend = () => {
            wx.getLocation({
                type: 'gcj02',
                isHighAccuracy: true,
                success: ({ latitude, longitude, accuracy }) => {
                    utils
                        .request({
                            url: '/sign/finish',
                            method: 'post',
                            data: {
                                community_id: this.data.postInfo.default_community_id,
                                lat: latitude,
                                lng: longitude,
                                accuracy
                            }
                        })
                        .then(
                            res => {
                                const { list } = this.data;
                                list[0] = {
                                    ...list[0],
                                    ...res.data
                                };

                                this.setData({
                                    list,
                                    disabled: true
                                });

                                $toast.clear();
                                $notify({
                                    type: 'success',
                                    message: '打卡成功'
                                });
                            },
                            res => {
                                $notify({
                                    type: 'danger',
                                    message: res.message
                                });
                                $toast.clear();
                            }
                        );
                },
                fail: res => {
                    $toast.clear();

                    $notify({
                        type: 'danger',
                        message: '获取当前经纬度失败，请重试'
                    });
                }
            });
        };

        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userLocation'] === undefined) {
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success: () => {
                            getLocationAndSend();
                        },
                        fail: () => {
                            $toast.fail({
                                message: '请授权位置'
                            });
                        }
                    });
                } else if (res.authSetting['scope.userLocation'] === true) {
                    getLocationAndSend();
                } else {
                    wx.openSetting({
                        success: res => {
                            if (res.authSetting['scope.userLocation']) {
                                getLocationAndSend();
                            } else {
                                $toast.clear();

                                $toast.fail({
                                    message: '请打开位置'
                                });
                            }
                        },
                        fail: () => {
                            $toast.fail({
                                message: '请授权位置'
                            });
                        }
                    });
                }
            },
            fail: () => {
                $toast.clear();

                $notify({
                    type: 'danger',
                    message: '获取小程序权限失败，请重试'
                });
            }
        });
    }
});
