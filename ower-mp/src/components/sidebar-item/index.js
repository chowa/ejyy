/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwComponent } from '../common/component';
import { useParent } from '../common/relation';
CwComponent({
    classes: ['active-class', 'disabled-class'],
    relation: useParent('sidebar'),
    props: {
        dot: Boolean,
        badge: null,
        info: null,
        title: String,
        disabled: Boolean
    },
    methods: {
        onClick() {
            const { parent } = this;
            if (!parent || this.data.disabled) {
                return;
            }
            const index = parent.children.indexOf(this);
            parent.setActive(index).then(() => {
                this.$emit('click', index);
                parent.$emit('change', index);
            });
        },
        setActive(selected) {
            return this.setData({ selected });
        }
    }
});
