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
import { useChildren } from '../common/relation';
CwComponent({
    field: true,
    relation: useChildren('radio', function(target) {
        this.updateChild(target);
    }),
    props: {
        value: {
            type: null,
            observer: 'updateChildren'
        },
        direction: String,
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
            const { value, disabled, direction } = this.data;
            child.setData({
                value,
                direction,
                disabled: disabled || child.data.disabled
            });
        }
    }
});
