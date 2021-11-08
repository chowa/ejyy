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
