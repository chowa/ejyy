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

// props for choose image
export const chooseImageProps = {
    sizeType: {
        type: Array,
        value: ['original', 'compressed']
    },
    capture: {
        type: Array,
        value: ['album', 'camera']
    }
};
// props for choose video
export const chooseVideoProps = {
    capture: {
        type: Array,
        value: ['album', 'camera']
    },
    compressed: {
        type: Boolean,
        value: true
    },
    maxDuration: {
        type: Number,
        value: 60
    },
    camera: {
        type: String,
        value: 'back'
    }
};
