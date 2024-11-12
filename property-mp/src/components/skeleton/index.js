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
CwComponent({
    classes: ['avatar-class', 'title-class', 'row-class'],
    props: {
        row: {
            type: Number,
            value: 0,
            observer(value) {
                this.setData({ rowArray: Array.from({ length: value }) });
            }
        },
        title: Boolean,
        avatar: Boolean,
        loading: {
            type: Boolean,
            value: true
        },
        animate: {
            type: Boolean,
            value: true
        },
        avatarSize: {
            type: String,
            value: '32px'
        },
        avatarShape: {
            type: String,
            value: 'round'
        },
        titleWidth: {
            type: String,
            value: '40%'
        },
        rowWidth: {
            type: null,
            value: '100%',
            observer(val) {
                this.setData({ isArray: val instanceof Array });
            }
        },
        inCell: Boolean
    },
    data: {
        isArray: false,
        rowArray: []
    }
});
