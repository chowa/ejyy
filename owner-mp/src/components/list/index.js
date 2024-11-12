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
    props: {
        fetching: Boolean,
        page_num: Number,
        page_amount: Number,
        list: Array,
        empty: String,
        icon: {
            type: String,
            value: 'empty'
        },
        fixed: {
            type: Boolean,
            value: true
        },
        inTabPage: {
            type: Boolean,
            value: false
        },
        useEmptySlot: Boolean,
        withFilter: Boolean
    },
    data: {
        page_size: 5
    }
});
