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
        description: {
            type: String,
            value: '暂无内容'
        },
        icon: {
            type: String,
            value: 'empty'
        },
        fixed: {
            type: Boolean,
            value: true
        },
        withCopyright: {
            type: Boolean,
            value: false
        }
    }
});
