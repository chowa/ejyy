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

import request from './request';

let accessid = '';
let signature = '';
let policy = '';
let dir = '';
let expire = 0;
let host = '';
let saveName = '';
let now = Date.now();

function setFileName(filename) {
    saveName = `${dir}${filename}`;
}

function ossHeaders() {
    return {
        host,
        key: saveName,
        policy,
        OSSAccessKeyId: accessid,
        success_action_status: '200',
        signature
    };
}

export default filename => {
    now = Date.now();

    if (expire < now + 3) {
        return request({
            url: '/upload/sign',
            method: 'get'
        }).then(res => {
            policy = res.data.policy;
            accessid = res.data.accessid;
            signature = res.data.signature;
            expire = parseInt(res.data.expire, 10);
            host = res.data.host;
            dir = res.data.dir;

            setFileName(filename);

            return ossHeaders();
        });
    } else {
        setFileName(filename);

        return Promise.resolve(ossHeaders());
    }
};
