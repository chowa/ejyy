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
    relation: useChildren('collapse-item'),
    props: {
        value: {
            type: null,
            observer: 'updateExpanded'
        },
        accordion: {
            type: Boolean,
            observer: 'updateExpanded'
        },
        border: {
            type: Boolean,
            value: true
        }
    },
    methods: {
        updateExpanded() {
            this.children.forEach(child => {
                child.updateExpanded();
            });
        },
        switch(name, expanded) {
            const { accordion, value } = this.data;
            const changeItem = name;
            if (!accordion) {
                name = expanded ? (value || []).concat(name) : (value || []).filter(activeName => activeName !== name);
            } else {
                name = expanded ? name : '';
            }
            if (expanded) {
                this.$emit('open', changeItem);
            } else {
                this.$emit('close', changeItem);
            }
            this.$emit('change', name);
            this.$emit('input', name);
        }
    }
});
