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

import { link } from '../mixins/link';
import { CwComponent } from '../common/component';
CwComponent({
    classes: ['title-class', 'label-class', 'value-class', 'right-icon-class', 'hover-class'],
    mixins: [link],
    props: {
        title: null,
        value: null,
        icon: String,
        size: String,
        label: String,
        center: Boolean,
        isLink: Boolean,
        isDetail: Boolean,
        required: Boolean,
        clickable: Boolean,
        titleWidth: String,
        customStyle: String,
        arrowDirection: String,
        useLabelSlot: Boolean,
        border: {
            type: Boolean,
            value: true
        },
        titleStyle: String
    },
    methods: {
        onClick(event) {
            this.$emit('click', event.detail);
            this.jumpLink();
        }
    }
});
