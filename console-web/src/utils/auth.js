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

import * as config from '@/config';

export default class auth {
    static getToken() {
        const token = localStorage.getItem(config.TOKEN_ID);
        return token ? token : undefined;
    }

    static getUserId() {
        const userId = localStorage.getItem(config.USER_ID);
        return /^\d+$/.test(userId) ? userId : undefined;
    }

    static isLogin() {
        return !!this.getToken();
    }

    static login(userId, token) {
        localStorage.setItem(config.TOKEN_ID, token);
        localStorage.setItem(config.USER_ID, userId);
    }

    static logout() {
        localStorage.removeItem(config.TOKEN_ID);
        localStorage.removeItem(config.USER_ID);
    }
}
