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

CwPage({
    data: {
        owerInfo: {},
        buildings: []
    },
    onLoad() {
        const res = wx.getStorageSync('OWER_INFO');

        if (!res) {
            return wx.navigateTo({
                url: '/pages/home/index'
            });
        }

        try {
            const cardInfo = JSON.parse(res);
            this.setData({
                owerInfo: cardInfo,
                buildings: [].concat(
                    cardInfo.houses,
                    cardInfo.merchants,
                    cardInfo.carports,
                    cardInfo.garages,
                    cardInfo.warehouses
                )
            });
        } catch (e) {
            wx.navigateTo({
                url: '/pages/home/index'
            });
        }
    }
});
