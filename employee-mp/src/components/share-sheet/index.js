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
        // whether to show popup
        show: Boolean,
        // overlay custom style
        overlayStyle: Object,
        // z-index
        zIndex: {
            type: Number,
            value: 100
        },
        title: String,
        cancelText: {
            type: String,
            value: '取消'
        },
        description: String,
        options: {
            type: Array,
            value: []
        },
        overlay: {
            type: Boolean,
            value: true
        },
        safeAreaInsetBottom: {
            type: Boolean,
            value: true
        },
        closeOnClickOverlay: {
            type: Boolean,
            value: true
        },
        duration: {
            type: null,
            value: 300
        }
    },
    methods: {
        onClickOverlay() {
            this.$emit('click-overlay');
        },
        onCancel() {
            this.onClose();
            this.$emit('cancel');
        },
        onSelect(event) {
            this.$emit('select', event.detail);
        },
        onClose() {
            this.$emit('close');
        }
    }
});
