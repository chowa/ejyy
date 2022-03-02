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

export function version(a, b) {
    const c1 = a.split('.');
    const c2 = b.split('.');
    const len = Math.max(c1.length, c2.length);

    while (c1.length < len) {
        c1.push('0');
    }

    while (c2.length < len) {
        c2.push('0');
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(c1[i]);
        const num2 = parseInt(c2[i]);

        if (num1 > num2) {
            return true;
        } else if (num1 < num2) {
            return false;
        }
    }

    return false;
}
