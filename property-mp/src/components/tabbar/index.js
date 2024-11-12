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
import { getRect } from '../common/utils';
CwComponent({
    relation: useChildren('tabbar-item', function() {
        this.updateChildren();
    }),
    props: {
        active: {
            type: null,
            observer: 'updateChildren'
        },
        activeColor: {
            type: String,
            observer: 'updateChildren'
        },
        inactiveColor: {
            type: String,
            observer: 'updateChildren'
        },
        fixed: {
            type: Boolean,
            value: true,
            observer: 'setHeight'
        },
        placeholder: {
            type: Boolean,
            observer: 'setHeight'
        },
        border: {
            type: Boolean,
            value: true
        },
        zIndex: {
            type: Number,
            value: 1
        },
        safeAreaInsetBottom: {
            type: Boolean,
            value: true
        }
    },
    data: {
        height: 50
    },
    methods: {
        updateChildren() {
            const { children } = this;
            if (!Array.isArray(children) || !children.length) {
                return;
            }
            children.forEach(child => child.updateFromParent());
        },
        setHeight() {
            if (!this.data.fixed || !this.data.placeholder) {
                return;
            }
            wx.nextTick(() => {
                getRect(this, '.cw-tabbar').then(res => {
                    this.setData({ height: res.height });
                });
            });
        }
    }
});
