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

import $toast from '../../components/toast/toast';

Page({
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
    },
    checkNetwork() {
        const toast = $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '正在检测网络'
        });

        setTimeout(() => {
            wx.getNetworkType({
                success: res => {
                    // 未连接网络
                    if (res.networkType === 'none') {
                        toast.setData({
                            type: 'fail',
                            message: '网络连接异常'
                        });
                    } else {
                        toast.setData({
                            type: 'success',
                            message: '网络已连接'
                        });

                        setTimeout(() => {
                            wx.redirectTo({
                                url: '/pages/login/index'
                            });
                        }, 1500);
                    }

                    toast.clear();
                }
            });
        }, 2000);
    }
});
