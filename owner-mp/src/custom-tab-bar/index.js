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

const tabMap = [
    'pages/home/index',
    // 'pages/neighbor/index',
    'pages/service/index',
    'pages/zone/index'
];

Component({
    data: {
        activeTab: 0
    },
    methods: {
        onTabChange(e) {
            wx.switchTab({
                url: `/${tabMap[e.detail]}`
            });
        }
    }
});
