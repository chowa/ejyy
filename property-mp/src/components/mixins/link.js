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

export const link = Behavior({
    properties: {
        url: String,
        linkType: {
            type: String,
            value: 'navigateTo'
        }
    },
    methods: {
        jumpLink(urlKey = 'url') {
            const url = this.data[urlKey];
            if (url) {
                if (this.data.linkType === 'navigateTo' && getCurrentPages().length > 9) {
                    wx.redirectTo({ url });
                } else {
                    wx[this.data.linkType]({ url });
                }
            }
        }
    }
});
