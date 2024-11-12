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

export default class Obdata {
    constructor(data) {
        this.struct = this.deep(data);
    }

    deep(obj) {
        const ret = {};

        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    ret[key] = [].concat(obj[key]);
                } else {
                    ret[key] = { ...obj[key] };
                }
            } else {
                ret[key] = obj[key];
            }
        }

        return ret;
    }

    clone() {
        return this.deep(this.struct);
    }

    merge(data) {
        const ret = {};

        for (let key in this.struct) {
            if (!(key in data)) {
                return;
            }
            if (typeof data[key] === 'object' && data[key] !== null) {
                if (Array.isArray(data[key])) {
                    ret[key] = [].concat(data[key]);
                } else {
                    ret[key] = { ...data[key] };
                }
            } else {
                ret[key] = data[key];
            }
        }

        return ret;
    }

    set(context, data) {
        for (let key in data) {
            if (typeof data[key] === 'object') {
                if (Array.isArray(data[key])) {
                    context[key] = [].concat(data[key]);
                } else {
                    context[key] = { ...data[key] };
                }
            } else {
                context[key] = data[key];
            }
        }
    }
}
