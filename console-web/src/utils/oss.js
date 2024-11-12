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
let expire = 0;
let host = '';
let saveName = '';
let now = Date.now();

function ossRes() {
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
    saveName = filename;

    if (expire < now + 10000) {
        return request.get('/upload/sign').then(res => {
            policy = res.data['policy'];
            accessid = res.data['accessid'];
            signature = res.data['signature'];
            expire = parseInt(res.data['expire']);
            host = res.data['host'];

            return ossRes();
        });
    } else {
        return Promise.resolve(ossRes());
    }
};
