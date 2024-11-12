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
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';

CwPage({
    data: {
        loading: false,
        redirect: null,
        loginCode: undefined
    },
    onLoad(opts) {
        this.setData({
            redirect: opts.redirect ? decodeURIComponent(opts.redirect) : null
        });
    },
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }

        this.getLoginCode();
    },
    getLoginCode() {
        wx.login({
            success: ({ code }) => {
                this.setData({ loginCode: code });

                if (!this.data.phone) {
                    timer = setTimeout(() => {
                        this.getLoginCode();
                    }, 4.5 * 60 * 10000);
                } else {
                    this.clearGetLoginCode();
                }
            }
        });
    },
    getPhoneNumber(e) {
        const { loading } = this.data;

        if (loading) {
            return;
        }

        if (e.detail.errMsg !== 'getPhoneNumber:ok') {
            return $notify({
                customNavBar: true,
                type: 'danger',
                message: '登录失败，请重试'
            });
        }

        this.setData({
            loading: true
        });

        const { brand, model, system, platform } = this.data.systemInfo;

        utils
            .request({
                url: '/user/mp_login',
                method: 'post',
                data: {
                    brand,
                    model,
                    system,
                    platform,
                    code: this.data.loginCode,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                }
            })
            .then(
                res => {
                    this.setData({
                        loading: false
                    });

                    this.bridge.updateData({
                        userInfo: res.data.userInfo,
                        postInfo: res.data.postInfo,
                        globalFetching: false
                    });

                    utils.storage.login(res.data.token);
                    utils.storage.setUserId(res.data.userInfo.id);

                    wx.redirectTo({
                        url: this.data.redirect == null ? '/pages/home/index' : this.data.redirect
                    });
                },
                res => {
                    this.setData({
                        loading: false
                    });
                    return $notify({
                        customNavBar: true,
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    }
});
