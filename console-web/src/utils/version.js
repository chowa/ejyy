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

// v1 新版本 v2老版本
export function compare(v1, v2) {
    if (!v2) {
        return true;
    }

    const arr1 = v1.split('.');
    const arr2 = v2.split('.');

    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let key = 0; key < arr1.length; key++) {
        const n1 = parseInt(arr1[key], 10);
        const n2 = parseInt(arr2[key], 10);

        if (n1 > n2) {
            return true;
        } else if (n1 < n2) {
            return false;
        }
    }

    return false;
}
