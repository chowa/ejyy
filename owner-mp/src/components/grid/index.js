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
    relation: useChildren('grid-item'),
    props: {
        square: {
            type: Boolean,
            observer: 'updateChildren'
        },
        gutter: {
            type: null,
            value: 0,
            observer: 'updateChildren'
        },
        clickable: {
            type: Boolean,
            observer: 'updateChildren'
        },
        columnNum: {
            type: Number,
            value: 4,
            observer: 'updateChildren'
        },
        center: {
            type: Boolean,
            value: true,
            observer: 'updateChildren'
        },
        border: {
            type: Boolean,
            value: true,
            observer: 'updateChildren'
        },
        direction: {
            type: String,
            observer: 'updateChildren'
        },
        iconSize: {
            type: String,
            observer: 'updateChildren'
        }
    },
    methods: {
        updateChildren() {
            this.children.forEach(child => {
                child.updateStyle();
            });
        }
    }
});
