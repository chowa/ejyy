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

import { FORM_ADAPT_WIDTH } from '@/config';

export default {
    data() {
        return {
            labelWidth: 160,
            winWidth: window.innerWidth
        };
    },
    created() {
        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        onResize() {
            this.winWidth = window.innerWidth;
        }
    },
    computed: {
        mlabelPostion() {
            return this.winWidth > FORM_ADAPT_WIDTH ? 'right' : 'top';
        },
        mlabelWidth() {
            return this.winWidth > FORM_ADAPT_WIDTH ? this.labelWidth : null;
        }
    }
};
