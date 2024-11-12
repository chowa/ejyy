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
import { BLUE, GRAY_DARK } from '../common/color';
CwComponent({
    classes: ['desc-class'],
    props: {
        icon: String,
        steps: Array,
        active: Number,
        direction: {
            type: String,
            value: 'horizontal'
        },
        activeColor: {
            type: String,
            value: BLUE
        },
        inactiveColor: {
            type: String,
            value: GRAY_DARK
        },
        activeIcon: {
            type: String,
            value: 'success'
        },
        inactiveIcon: String
    },
    methods: {
        onClick(event) {
            const { index } = event.currentTarget.dataset;
            this.$emit('click-step', index);
        }
    }
});
