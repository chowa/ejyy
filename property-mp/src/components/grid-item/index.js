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
import { useParent } from '../common/relation';
import { link } from '../mixins/link';
CwComponent({
    relation: useParent('grid'),
    classes: ['content-class', 'icon-class', 'text-class'],
    mixins: [link],
    props: {
        icon: String,
        iconColor: String,
        dot: Boolean,
        info: null,
        badge: null,
        text: String,
        useSlot: Boolean
    },
    data: {
        viewStyle: ''
    },
    mounted() {
        this.updateStyle();
    },
    methods: {
        updateStyle() {
            if (!this.parent) {
                return;
            }
            const { data, children } = this.parent;
            const { columnNum, border, square, gutter, clickable, center, direction, iconSize } = data;
            this.setData({
                center,
                border,
                square,
                gutter,
                clickable,
                direction,
                iconSize,
                index: children.indexOf(this),
                columnNum
            });
        },
        onClick() {
            this.$emit('click');
            this.jumpLink();
        }
    }
});
