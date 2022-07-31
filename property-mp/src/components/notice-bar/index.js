/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwComponent } from '../common/component';
import { getRect, requestAnimationFrame } from '../common/utils';
CwComponent({
    props: {
        text: {
            type: String,
            value: '',
            observer: 'init'
        },
        mode: {
            type: String,
            value: ''
        },
        url: {
            type: String,
            value: ''
        },
        openType: {
            type: String,
            value: 'navigate'
        },
        delay: {
            type: Number,
            value: 1
        },
        speed: {
            type: Number,
            value: 50,
            observer: 'init'
        },
        scrollable: {
            type: Boolean,
            value: true
        },
        leftIcon: {
            type: String,
            value: ''
        },
        color: String,
        backgroundColor: String,
        background: String,
        wrapable: Boolean
    },
    data: {
        show: true
    },
    created() {
        this.resetAnimation = wx.createAnimation({
            duration: 0,
            timingFunction: 'linear'
        });
    },
    destroyed() {
        this.timer && clearTimeout(this.timer);
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            requestAnimationFrame(() => {
                Promise.all([getRect(this, '.cw-notice-bar__content'), getRect(this, '.cw-notice-bar__wrap')]).then(
                    rects => {
                        const [contentRect, wrapRect] = rects;
                        if (contentRect == null || wrapRect == null || !contentRect.width || !wrapRect.width) {
                            return;
                        }
                        const { speed, scrollable, delay } = this.data;
                        if (scrollable || wrapRect.width < contentRect.width) {
                            const duration = (contentRect.width / speed) * 1000;
                            this.wrapWidth = wrapRect.width;
                            this.contentWidth = contentRect.width;
                            this.duration = duration;
                            this.animation = wx.createAnimation({
                                duration,
                                timingFunction: 'linear',
                                delay
                            });
                            this.scroll();
                        }
                    }
                );
            });
        },
        scroll() {
            this.timer && clearTimeout(this.timer);
            this.timer = null;
            this.setData({
                animationData: this.resetAnimation
                    .translateX(this.wrapWidth)
                    .step()
                    .export()
            });
            requestAnimationFrame(() => {
                this.setData({
                    animationData: this.animation
                        .translateX(-this.contentWidth)
                        .step()
                        .export()
                });
            });
            this.timer = setTimeout(() => {
                this.scroll();
            }, this.duration);
        },
        onClickIcon(event) {
            if (this.data.mode === 'closeable') {
                this.timer && clearTimeout(this.timer);
                this.timer = null;
                this.setData({ show: false });
                this.$emit('close', event.detail);
            }
        },
        onClick(event) {
            this.$emit('click', event);
        }
    }
});
