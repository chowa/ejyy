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

import { getRect } from '../common/utils';
import { CwComponent } from '../common/component';
import { useParent } from '../common/relation';
CwComponent({
    relation: useParent('index-bar'),
    props: {
        useSlot: Boolean,
        index: null
    },
    data: {
        active: false,
        wrapperStyle: '',
        anchorStyle: ''
    },
    methods: {
        scrollIntoView(scrollTop) {
            getRect(this, '.cw-index-anchor-wrapper').then(rect => {
                wx.pageScrollTo({
                    duration: 0,
                    scrollTop: scrollTop + rect.top - this.parent.data.stickyOffsetTop
                });
            });
        }
    }
});
