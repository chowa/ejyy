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

export const commonProps = {
    value: {
        type: String,
        observer(value) {
            if (value !== this.value) {
                this.setData({ innerValue: value });
                this.value = value;
            }
        }
    },
    placeholder: String,
    placeholderStyle: String,
    placeholderClass: String,
    disabled: Boolean,
    maxlength: {
        type: Number,
        value: -1
    },
    cursorSpacing: {
        type: Number,
        value: 50
    },
    autoFocus: Boolean,
    focus: Boolean,
    cursor: {
        type: Number,
        value: -1
    },
    selectionStart: {
        type: Number,
        value: -1
    },
    selectionEnd: {
        type: Number,
        value: -1
    },
    adjustPosition: {
        type: Boolean,
        value: true
    },
    holdKeyboard: Boolean
};
export const inputProps = {
    type: {
        type: String,
        value: 'text'
    },
    password: Boolean,
    confirmType: String,
    confirmHold: Boolean
};
export const textareaProps = {
    autoHeight: Boolean,
    fixed: Boolean,
    showConfirmBar: {
        type: Boolean,
        value: true
    },
    disableDefaultPadding: {
        type: Boolean,
        value: true
    }
};
