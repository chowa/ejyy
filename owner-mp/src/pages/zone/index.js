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
import { ASSETS_HOST, VERSION } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        VERSION
    },
    onShow() {
        if (typeof this.getTabBar === 'function') {
            this.getTabBar().setData({
                activeTab: 2
            });
        }
    },
    checkUpdate() {
        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(res => {
            if (res.hasUpdate) {
                wx.showLoading({
                    title: '版本更新中…',
                    mask: true
                });
            } else {
                wx.showToast({
                    title: '已是最新版本',
                    icon: 'success',
                    mask: true
                });
            }
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
    }
});
