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
