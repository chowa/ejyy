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
import { useChildren } from '../common/relation';
CwComponent({
    field: true,
    relation: useChildren('radio', function(target) {
        this.updateChild(target);
    }),
    props: {
        value: {
            type: null,
            observer: 'updateChildren'
        },
        direction: String,
        disabled: {
            type: Boolean,
            observer: 'updateChildren'
        }
    },
    methods: {
        updateChildren() {
            this.children.forEach(child => this.updateChild(child));
        },
        updateChild(child) {
            const { value, disabled, direction } = this.data;
            child.setData({
                value,
                direction,
                disabled: disabled || child.data.disabled
            });
        }
    }
});
