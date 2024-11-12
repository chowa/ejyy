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

import { CwComponent } from '../common/component';
CwComponent({
    props: {
        show: Boolean,
        customStyle: String,
        duration: {
            type: null,
            value: 300
        },
        zIndex: {
            type: Number,
            value: 1
        }
    },
    methods: {
        onClick() {
            this.$emit('click');
        },
        // for prevent touchmove
        noop() {}
    }
});
