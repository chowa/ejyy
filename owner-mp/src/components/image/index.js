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
import { button } from '../mixins/button';
import { openType } from '../mixins/open-type';
CwComponent({
    mixins: [button, openType],
    classes: ['custom-class', 'loading-class', 'error-class', 'image-class'],
    props: {
        src: {
            type: String,
            observer() {
                this.setData({
                    error: false,
                    loading: true
                });
            }
        },
        round: Boolean,
        width: null,
        height: null,
        radius: null,
        lazyLoad: Boolean,
        useErrorSlot: Boolean,
        useLoadingSlot: Boolean,
        showMenuByLongpress: Boolean,
        fit: {
            type: String,
            value: 'cover'
        },
        showError: {
            type: Boolean,
            value: true
        },
        showLoading: {
            type: Boolean,
            value: true
        }
    },
    data: {
        error: false,
        loading: true,
        viewStyle: ''
    },
    methods: {
        onLoad(event) {
            this.setData({
                loading: false
            });
            this.$emit('load', event.detail);
        },
        onError(event) {
            this.setData({
                loading: false,
                error: true
            });
            this.$emit('error', event.detail);
        },
        onClick(event) {
            this.$emit('click', event.detail);
        }
    }
});
