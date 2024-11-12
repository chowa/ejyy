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

import { Message } from 'view-design';
import router from '@/router';
import * as config from '@/config';
import * as utils from '@/utils';

export default ({ url, data, onProgress }) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    const token = utils.auth.getToken();

    xhr.open('post', url, true);

    if (token) {
        xhr.setRequestHeader(config.AUTH_HEADER_NAME, token);
    }

    for (let key in data) {
        fd.append(key, data[key]);
    }

    xhr.upload.addEventListener(
        'progress',
        e => {
            const progress = Math.floor((e.loaded / e.total) * 100);

            if (typeof onProgress === 'function') {
                onProgress(progress);
            }
        },
        false
    );

    return new Promise(resolve => {
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                let json = {};

                try {
                    json = JSON.parse(xhr.responseText);
                } catch (e) {
                    throw Error(e);
                }

                if (xhr.status === 200) {
                    resolve(json);
                } else if (xhr.status === 401) {
                    if (router.currentRoute.path !== '/login') {
                        router.replace({
                            path: '/login',
                            query: { redirect: router.currentRoute.fullPath }
                        });
                    }
                    return;
                } else if (json.message) {
                    Message.error(json.message);
                }
            }
        };

        xhr.send(fd);
    });
};
