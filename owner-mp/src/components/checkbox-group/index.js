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

import { useChildren } from '../common/relation';
import { CwComponent } from '../common/component';
CwComponent({
    field: true,
    relation: useChildren('checkbox', function(target) {
        this.updateChild(target);
    }),
    props: {
        max: Number,
        value: {
            type: Array,
            observer: 'updateChildren'
        },
        disabled: {
            type: Boolean,
            observer: 'updateChildren'
        }
    },
    methods: {
        updateChildren() {
            this.children.forEach(child => this.updateChild(child));
        },
        updateChild(child) {
            const { value, disabled } = this.data;
            child.setData({
                value: value.indexOf(child.data.name) !== -1,
                parentDisabled: disabled
            });
        }
    }
});
