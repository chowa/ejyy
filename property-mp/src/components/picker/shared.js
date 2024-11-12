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

export const pickerProps = {
    title: String,
    loading: Boolean,
    showToolbar: Boolean,
    cancelButtonText: {
        type: String,
        value: '取消'
    },
    confirmButtonText: {
        type: String,
        value: '确认'
    },
    visibleItemCount: {
        type: Number,
        value: 6
    },
    itemHeight: {
        type: Number,
        value: 44
    }
};
