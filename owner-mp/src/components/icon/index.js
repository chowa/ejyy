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
        dot: Boolean,
        info: null,
        size: null,
        color: String,
        customStyle: String,
        classPrefix: {
            type: String,
            value: 'cw-icon'
        },
        name: {
            type: String,
            observer(val) {
                this.setData({
                    isImageName: val.indexOf('/') !== -1
                });
            }
        }
    },
    methods: {
        onClick() {
            this.$emit('click');
        }
    }
});
