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

export function hasProperty(obj, property) {
    if (obj === undefined || obj === null) {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(obj, property);
}

// 问题在于vue 的defineProperty属性会导致判断失败，所以此方法只针对filters
export function vueSame(a, b) {
    return Object.keys(a).every(key => {
        if (typeof a[key] === 'object' && a[key] !== null) {
            return same(a[key], b[key]);
        }
        return a[key] === b[key];
    });
}

export function same(a, b) {
    if (a === b) {
        return true;
    }

    if (typeof a === 'object' && typeof b === 'object') {
        if (a === null || b === null) {
            return a === b;
        } else if (a instanceof Date && b instanceof Date) {
            return +a === +b;
        } else if (a instanceof RegExp && b instanceof RegExp) {
            return a.toString() === b.toString();
        } else if (Array.isArray(a) && Array.isArray(b)) {
            const arrLen = a.length;

            if (arrLen !== b.length) {
                return false;
            }
            for (let i = arrLen; i--; i !== 0) {
                if (!same(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        } else {
            const keys = Object.keys(a);
            const objLen = keys.length;

            if (objLen !== Object.keys(b).length) {
                return false;
            }

            for (let i = objLen; i--; i !== 0) {
                if (!hasProperty(b, keys[i])) {
                    return false;
                }
            }

            for (let i = objLen; i--; i !== 0) {
                const key = keys[i];
                if (!same(a[key], b[key])) {
                    return false;
                }
            }
        }
    }

    return a !== a && b !== b;
}
