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

export const basic = Behavior({
    methods: {
        $emit(name, detail, options) {
            this.triggerEvent(name, detail, options);
        },
        set(data) {
            this.setData(data);
            return new Promise(resolve => wx.nextTick(resolve));
        }
    }
});
