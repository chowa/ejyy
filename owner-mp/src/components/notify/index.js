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
import { WHITE } from '../common/color';
import { getSystemInfoSync } from '../common/utils';

const app = getApp();

CwComponent({
    props: {
        message: String,
        background: String,
        type: {
            type: String,
            value: 'danger'
        },
        color: {
            type: String,
            value: WHITE
        },
        duration: {
            type: Number,
            value: 3000
        },
        zIndex: {
            type: Number,
            value: 110
        },
        customNavBar: {
            type: Boolean,
            value: false
        },
        offsetTop: {
            type: Number,
            value: app.data.systemInfo.navBarHeight + app.data.systemInfo.statusBarHeight
        },
        top: null
    },
    data: {
        show: false,
        onOpened: null,
        onClose: null,
        onClick: null
    },
    methods: {
        show() {
            const { duration, onOpened } = this.data;
            clearTimeout(this.timer);
            this.setData({ show: true });
            wx.nextTick(onOpened);
            if (duration > 0 && duration !== Infinity) {
                this.timer = setTimeout(() => {
                    this.hide();
                }, duration);
            }
        },
        hide() {
            const { onClose } = this.data;
            clearTimeout(this.timer);
            this.setData({ show: false });
            wx.nextTick(onClose);
        },
        onTap(event) {
            const { onClick } = this.data;
            if (onClick) {
                onClick(event.detail);
            }
        }
    }
});
