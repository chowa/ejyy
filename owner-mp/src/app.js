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

import utils from './utils/index';

App({
    data: {
        globalFetching: true,
        userInfo: {},
        communityInfo: {
            list: [],
            current: null
        },
        systemInfo: {},
        navBarHeight: 'auto'
    },

    onLaunch() {
        // 检查更新
        this.checkUpdate();
        // 适配
        this.adaptive();

        // 检查网络
        this.checkNetwork();
    },

    onShow(opts) {
        if (utils.storage.isLogin()) {
            this.getUserInfo();
        } else {
            const query = [];
            for (let key in opts.query) {
                query.push(`${key}=${opts.query[key]}`);
            }
            const redirect = encodeURIComponent(`/${opts.path}${query.length ? '?' : ''}${query.join('&')}`);

            return wx.redirectTo({
                url: `/pages/login/index?redirect=${redirect}`
            });
        }
    },

    onPageNotFound() {
        wx.redirectTo({
            url: '/pages/error/general'
        });
    },

    checkUpdate() {
        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(res => {
            if (!res.hasUpdate) {
                return;
            }

            wx.showLoading({
                title: '版本更新中…',
                mask: true
            });

            updateManager.onUpdateReady(() => {
                wx.hideLoading();
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success(res) {
                        if (res.confirm) {
                            updateManager.applyUpdate();
                        }
                    }
                });
            });

            updateManager.onUpdateFailed(() => {
                wx.hideLoading();
                wx.showToast({
                    title: '更新失败',
                    icon: 'error'
                });
            });
        });
    },

    adaptive() {
        const systemInfo = wx.getSystemInfoSync();

        // 导航胶囊
        const { top, height } = wx.getMenuButtonBoundingClientRect();

        this.data.systemInfo = systemInfo;
        this.data.systemInfo.navBarHeight = (top - systemInfo.statusBarHeight) * 2 + height;
    },

    checkNetwork() {
        wx.getNetworkType({
            success: res => {
                // 未连接网络
                if (res.networkType === 'none') {
                    wx.redirectTo({ url: '/pages/error/network' });
                }
            }
        });
    },

    getUserInfo() {
        return utils
            .request({
                url: '/user/info',
                method: 'get'
            })
            .then(res => {
                this.updateData({
                    userInfo: res.data.userInfo,
                    communityInfo: res.data.communityInfo,
                    globalFetching: false
                });
                var pages = getCurrentPages() //获取加载的页面
                var currentPage = pages[pages.length - 1].route //获取当前页面的对象 修改数量可以获取之前跳转页面的地址
                if (currentPage !== 'pages/zone/avatar') {
                  if (!res.data.userInfo.intact) {
                    wx.redirectTo({
                        url: '/pages/zone/supplement'
                    });
                  } else if (res.data.communityInfo.list.length === 0) {
                      wx.redirectTo({
                          url: '/pages/community/binding'
                      });
                  }
                }
            });
    },

    onDataFuns: [],

    on(event, fn) {
        if (event === 'data') {
            this.onDataFuns.push(fn);
            this.dataEmitter();
        }
    },
    off(event, fn) {
        if (event === 'data') {
            this.onDataFuns.splice(
                this.onDataFuns.findIndex(rfn => fn === rfn),
                1
            );
        }
    },
    dataEmitter() {
        this.onDataFuns.forEach(fn => {
            fn(this.data);
        });
    },
    updateData(data) {
        this.data = {
            ...this.data,
            ...data
        };

        this.dataEmitter();
    }
});
