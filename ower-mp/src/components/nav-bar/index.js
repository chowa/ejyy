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
import { getRect, getSystemInfoSync } from '../common/utils';
CwComponent({
    classes: ['title-class'],
    props: {
        title: String,
        fixed: {
            type: Boolean,
            observer: 'setHeight'
        },
        placeholder: {
            type: Boolean,
            observer: 'setHeight'
        },
        leftText: String,
        rightText: String,
        customStyle: String,
        leftArrow: Boolean,
        border: {
            type: Boolean,
            value: true
        },
        zIndex: {
            type: Number,
            value: 1
        },
        safeAreaInsetTop: {
            type: Boolean,
            value: true
        }
    },
    data: {
        height: 46
    },
    created() {
        const { statusBarHeight } = getSystemInfoSync();
        this.setData({
            statusBarHeight,
            height: 46 + statusBarHeight
        });
    },
    mounted() {
        this.setHeight();
    },
    methods: {
        onClickLeft() {
            this.$emit('click-left');
        },
        onClickRight() {
            this.$emit('click-right');
        },
        setHeight() {
            if (!this.data.fixed || !this.data.placeholder) {
                return;
            }
            wx.nextTick(() => {
                getRect(this, '.cw-nav-bar').then(res => {
                    if (res && 'height' in res) {
                        this.setData({ height: res.height });
                    }
                });
            });
        }
    }
});
