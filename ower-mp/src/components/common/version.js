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

import { getSystemInfoSync } from './utils';
function compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i], 10);
        const num2 = parseInt(v2[i], 10);
        if (num1 > num2) {
            return 1;
        }
        if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}
function gte(version) {
    const system = getSystemInfoSync();
    return compareVersion(system.SDKVersion, version) >= 0;
}
export function canIUseModel() {
    return gte('2.9.3');
}
export function canIUseFormFieldButton() {
    return gte('2.10.3');
}
export function canIUseAnimate() {
    return gte('2.9.0');
}
export function canIUseGroupSetData() {
    return gte('2.4.0');
}
export function canIUseNextTick() {
    return wx.canIUse('nextTick');
}
export function canIUseCanvas2d() {
    return gte('2.9.0');
}
