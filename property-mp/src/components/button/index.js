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
import { canIUseFormFieldButton } from '../common/version';
const mixins = [button, openType];
if (canIUseFormFieldButton()) {
    mixins.push('wx://form-field-button');
}
CwComponent({
    mixins,
    classes: ['hover-class', 'loading-class'],
    data: {
        baseStyle: ''
    },
    props: {
        formType: String,
        icon: String,
        classPrefix: {
            type: String,
            value: 'cw-icon'
        },
        plain: Boolean,
        block: Boolean,
        round: Boolean,
        square: Boolean,
        loading: Boolean,
        hairline: Boolean,
        disabled: Boolean,
        loadingText: String,
        customStyle: String,
        loadingType: {
            type: String,
            value: 'circular'
        },
        type: {
            type: String,
            value: 'default'
        },
        dataset: null,
        size: {
            type: String,
            value: 'normal'
        },
        loadingSize: {
            type: String,
            value: '20px'
        },
        color: String
    },
    methods: {
        onClick() {
            if (!this.data.loading) {
                this.$emit('click');
            }
        },
        noop() {}
    }
});
