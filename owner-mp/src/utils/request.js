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

import * as config from '../config';
import * as storage from './storage';

function request({ url, data, method }) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${config.API_HOST}/mp${url}`,
            header: {
                [config.AUTH_HEADER_NAME]: storage.token(),
                ['wechat-mp-request']: true
            },
            data,
            dataType: 'json',
            method,
            success: res => {
                if (res.statusCode === 401) {
                    storage.logout();
                    const pages = getCurrentPages();

                    if (pages.length === 0) {
                        const { route, options } = pages[pages.length - 1];
                        const query = [];
                        for (let key in options) {
                            query.push(`${key}=${options[key]}`);
                        }
                        const redirect = encodeURIComponent(`/${route}${query.length ? '?' : ''}${query.join('&')}`);

                        return wx.redirectTo({
                            url: `/pages/login/index?redirect=${redirect}`
                        });
                    } else {
                        return wx.redirectTo({
                            url: '/pages/login/index'
                        });
                    }
                }

                switch (res.statusCode) {
                    case 400:
                        res.data = { message: '错误请求' };
                        break;

                    case 403:
                        res.data = { message: '权限不足，拒绝访问' };
                        break;
                    case 404:
                        res.data = { message: '请求错误，未找到该资源' };
                        break;
                    case 405:
                        res.data = { message: '请求方法未允许' };
                        break;
                    case 408:
                        res.data = { message: '请求超时' };
                        break;
                    case 500:
                        res.data = { message: '服务器端出错' };
                        break;
                    case 501:
                        res.data = { message: '网络未实现' };
                        break;
                    case 502:
                        res.data = { message: '网络错误' };
                        break;
                    case 503:
                        res.data = { message: '服务不可用' };
                        break;
                    case 504:
                        res.data = { message: '网络超时' };
                        break;
                    case 505:
                        res.data = { message: 'http版本不支持该请求' };
                        break;
                }

                if (res.data.code === 200 && res.statusCode === 200) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail: res => {
                reject({ message: res.errMsg });
            }
        });
    });
}

export default request;
