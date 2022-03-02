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
