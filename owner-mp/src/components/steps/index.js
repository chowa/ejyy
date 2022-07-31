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
