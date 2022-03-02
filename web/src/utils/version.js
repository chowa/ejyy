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
