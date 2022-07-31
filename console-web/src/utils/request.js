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

import axios from 'axios';
import { Message } from 'view-design';
import router from '@/router';
import * as config from '@/config';
import * as utils from '@/utils';

const service = axios.create({
    timeout: 3 * 1000
});

service.interceptors.request.use(
    options => {
        if (options.data) {
            if (options.uploadFile) {
                const data = new FormData();

                for (let key in options.data) {
                    data.append(key, options.data[key]);
                }

                options.data = data;
                options.headers = {
                    'Content-Type': 'multipart/form-data'
                };

                delete options.uploadFile;
            } else {
                options.data = JSON.stringify(options.data);
                options.headers = {
                    'Content-Type': 'application/json'
                };
            }
        }

        const token = utils.auth.getToken();

        if (token) {
            options.headers[config.AUTH_HEADER_NAME] = token;
        }

        options.url = `/pc${options.url}`;

        return options;
    },
    error => {
        Promise.reject(error);
    }
);

service.interceptors.response.use(
    response => {
        if (response.data.code === 200) {
            return response.data;
        } else {
            if (response.data.code === -66) {
                router.replace({ path: '/user/init' });
            } else if (response.data.message) {
                Message.error(response.data.message);
            }

            return Promise.reject(response.data);
        }
    },
    error => {
        if (error && error.response) {
            switch (error.response.status) {
                case 400:
                    error.message = '错误请求';
                    break;
                case 401:
                    error.message = 401;
                    if (router.currentRoute.path !== '/user/login') {
                        router.replace({
                            path: '/user/login',
                            query: { redirect: router.currentRoute.fullPath }
                        });
                    }
                    utils.auth.logout();
                    break;

                case 403:
                    error.message = '权限不足，拒绝访问';
                    break;
                case 404:
                    error.message = '请求错误,未找到该资源';
                    break;
                case 405:
                    error.message = '请求方法未允许';
                    break;
                case 408:
                    error.message = '请求超时';
                    break;
                case 500:
                    error.message = '服务器端出错';
                    break;
                case 501:
                    error.message = '网络未实现';
                    break;
                case 502:
                    error.message = '网络错误';
                    break;
                case 503:
                    error.message = '服务不可用';
                    break;
                case 504:
                    error.message = '网络超时';
                    break;
                case 505:
                    error.message = 'http版本不支持该请求';
                    break;
                default:
                    error.message = `连接错误${error.response.status}`;
            }
        } else {
            error.message = '服务器响应超时，请刷新当前页';
        }

        if (error.message !== 401) {
            Message.error(error.message);
        }

        return Promise.reject(error.response);
    }
);

const request = function({ url, method, data, params, uploadFile }) {
    const options = {
        url,
        method
    };

    if (data) {
        options.data = data;
    }

    if (params) {
        options.params = params;
    }

    options.uploadFile = uploadFile ? true : false;

    return service(options);
};

request.get = function(url, params) {
    return request({
        url,
        params,
        method: 'get'
    });
};

request.post = function(url, data) {
    return request({
        url,
        data,
        method: 'post'
    });
};

request.put = function(url, data) {
    return request({
        url,
        data,
        method: 'put'
    });
};

request.patch = function(url, data) {
    return request({
        url,
        data,
        method: 'patch'
    });
};

request.delete = function(url, data) {
    return request({
        url,
        data,
        method: 'delete'
    });
};

export default request;
