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

import * as config from '../config';

export function token() {
    return wx.getStorageSync(config.TOKEN_NAME) || null;
}
// 是否登录
export function isLogin() {
    return !!token();
}

export function logout() {
    wx.removeStorageSync(config.TOKEN_NAME);
}

export function login(token) {
    wx.setStorageSync(config.TOKEN_NAME, token);
}

export function userId() {
    return wx.getStorageSync(config.USER_ID) || null;
}

export function setUserId(id) {
    if (id) {
        wx.setStorageSync(config.USER_ID, id);
    } else {
        wx.removeStorageSync(config.USER_ID);
    }
}
