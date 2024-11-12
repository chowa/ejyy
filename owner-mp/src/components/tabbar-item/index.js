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
CwComponent({
    props: {
        info: null,
        name: null,
        icon: String,
        dot: Boolean,
        iconPrefix: {
            type: String,
            value: 'cw-icon'
        }
    },
    relation: useParent('tabbar'),
    data: {
        active: false,
        activeColor: '',
        inactiveColor: ''
    },
    methods: {
        onClick() {
            const { parent } = this;
            if (parent) {
                const index = parent.children.indexOf(this);
                const active = this.data.name || index;
                if (active !== this.data.active) {
                    parent.$emit('change', active);
                }
            }
            this.$emit('click');
        },
        updateFromParent() {
            const { parent } = this;
            if (!parent) {
                return;
            }
            const index = parent.children.indexOf(this);
            const parentData = parent.data;
            const { data } = this;
            const active = (data.name || index) === parentData.active;
            const patch = {};
            if (active !== data.active) {
                patch.active = active;
            }
            if (parentData.activeColor !== data.activeColor) {
                patch.activeColor = parentData.activeColor;
            }
            if (parentData.inactiveColor !== data.inactiveColor) {
                patch.inactiveColor = parentData.inactiveColor;
            }
            if (Object.keys(patch).length > 0) {
                this.setData(patch);
            }
        }
    }
});
