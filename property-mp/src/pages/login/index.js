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
import utils from '../../utils/index';

CwPage({
    data: {
        loading: false,
        redirect: null
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
    },
    login() {
        const { loading } = this.data;

        if (loading) {
            return;
        }

        this.setData({
            loading: true
        });

        wx.login({
            success: ({ code }) => {
                const { brand, model, system, platform } = this.data.systemInfo;

                utils
                    .request({
                        url: '/user/mp_login',
                        method: 'post',
                        data: {
                            code,
                            brand,
                            model,
                            system,
                            platform
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
            },
            fail: res => {
                return $notify({
                    customNavBar: true,
                    type: 'danger',
                    message: '登录失败，请重试'
                });
            }
        });
    }
});
