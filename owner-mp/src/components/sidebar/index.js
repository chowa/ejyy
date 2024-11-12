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
import { useChildren } from '../common/relation';
CwComponent({
    relation: useChildren('sidebar-item', function() {
        this.setActive(this.data.activeKey);
    }),
    props: {
        activeKey: {
            type: Number,
            value: 0,
            observer: 'setActive'
        }
    },
    beforeCreate() {
        this.currentActive = -1;
    },
    methods: {
        setActive(activeKey) {
            const { children, currentActive } = this;
            if (!children.length) {
                return Promise.resolve();
            }
            this.currentActive = activeKey;
            const stack = [];
            if (currentActive !== activeKey && children[currentActive]) {
                stack.push(children[currentActive].setActive(false));
            }
            if (children[activeKey]) {
                stack.push(children[activeKey].setActive(true));
            }
            return Promise.all(stack);
        }
    }
});
