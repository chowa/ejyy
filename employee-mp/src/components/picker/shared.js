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
