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
