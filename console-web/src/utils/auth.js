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
