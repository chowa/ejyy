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
    props: {
        show: Boolean,
        title: String,
        cancelText: String,
        description: String,
        round: {
            type: Boolean,
            value: true
        },
        zIndex: {
            type: Number,
            value: 100
        },
        actions: {
            type: Array,
            value: []
        },
        overlay: {
            type: Boolean,
            value: true
        },
        closeOnClickOverlay: {
            type: Boolean,
            value: true
        },
        closeOnClickAction: {
            type: Boolean,
            value: true
        },
        safeAreaInsetBottom: {
            type: Boolean,
            value: true
        }
    },
    methods: {
        onSelect(event) {
            const { index } = event.currentTarget.dataset;
            const item = this.data.actions[index];
            if (item && !item.disabled && !item.loading) {
                this.$emit('select', item);
                if (this.data.closeOnClickAction) {
                    this.onClose();
                }
            }
        },
        onCancel() {
            this.$emit('cancel');
        },
        onClose() {
            this.$emit('close');
        },
        onClickOverlay() {
            this.$emit('click-overlay');
            this.onClose();
        }
    }
});
