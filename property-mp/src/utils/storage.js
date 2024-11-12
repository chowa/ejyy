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
