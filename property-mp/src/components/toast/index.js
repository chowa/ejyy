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
        mask: Boolean,
        message: String,
        forbidClick: Boolean,
        zIndex: {
            type: Number,
            value: 1000
        },
        type: {
            type: String,
            value: 'text'
        },
        loadingType: {
            type: String,
            value: 'circular'
        },
        position: {
            type: String,
            value: 'middle'
        }
    },
    methods: {
        // for prevent touchmove
        noop() {}
    }
});
