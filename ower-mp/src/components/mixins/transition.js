/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

// @ts-nocheck
import { requestAnimationFrame } from '../common/utils';
import { isObj } from '../common/validator';
const getClassNames = name => ({
    enter: `cw-${name}-enter cw-${name}-enter-active enter-class enter-active-class`,
    'enter-to': `cw-${name}-enter-to cw-${name}-enter-active enter-to-class enter-active-class`,
    leave: `cw-${name}-leave cw-${name}-leave-active leave-class leave-active-class`,
    'leave-to': `cw-${name}-leave-to cw-${name}-leave-active leave-to-class leave-active-class`
});
export function transition(showDefaultValue) {
    return Behavior({
        properties: {
            customStyle: String,
            // @ts-ignore
            show: {
                type: Boolean,
                value: showDefaultValue,
                observer: 'observeShow'
            },
            // @ts-ignore
            duration: {
                type: null,
                value: 300,
                observer: 'observeDuration'
            },
            name: {
                type: String,
                value: 'fade'
            }
        },
        data: {
            type: '',
            inited: false,
            display: false
        },
        ready() {
            if (this.data.show === true) {
                this.observeShow(true, false);
            }
        },
        methods: {
            observeShow(value, old) {
                if (value === old) {
                    return;
                }
                value ? this.enter() : this.leave();
            },
            enter() {
                const { duration, name } = this.data;
                const classNames = getClassNames(name);
                const currentDuration = isObj(duration) ? duration.enter : duration;
                this.status = 'enter';
                this.$emit('before-enter');
                requestAnimationFrame(() => {
                    if (this.status !== 'enter') {
                        return;
                    }
                    this.$emit('enter');
                    this.setData({
                        inited: true,
                        display: true,
                        classes: classNames.enter,
                        currentDuration
                    });
                    requestAnimationFrame(() => {
                        if (this.status !== 'enter') {
                            return;
                        }
                        this.transitionEnded = false;
                        this.setData({ classes: classNames['enter-to'] });
                    });
                });
            },
            leave() {
                if (!this.data.display) {
                    return;
                }
                const { duration, name } = this.data;
                const classNames = getClassNames(name);
                const currentDuration = isObj(duration) ? duration.leave : duration;
                this.status = 'leave';
                this.$emit('before-leave');
                requestAnimationFrame(() => {
                    if (this.status !== 'leave') {
                        return;
                    }
                    this.$emit('leave');
                    this.setData({
                        classes: classNames.leave,
                        currentDuration
                    });
                    requestAnimationFrame(() => {
                        if (this.status !== 'leave') {
                            return;
                        }
                        this.transitionEnded = false;
                        setTimeout(() => this.onTransitionEnd(), currentDuration);
                        this.setData({ classes: classNames['leave-to'] });
                    });
                });
            },
            onTransitionEnd() {
                if (this.transitionEnded) {
                    return;
                }
                this.transitionEnded = true;
                this.$emit(`after-${this.status}`);
                const { show, display } = this.data;
                if (!show && display) {
                    this.setData({ display: false });
                }
            }
        }
    });
}
