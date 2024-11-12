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
