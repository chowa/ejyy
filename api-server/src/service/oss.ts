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

import crypto from 'crypto';
import config from '~/config';

interface OssSign {
    policy: string;
    signature: string;
    accessid: string;
    expire: number;
    host: string;
    dir: string;
}

export function sign(): OssSign {
    const { accessKeyId, accessKeySecret, oss } = config.aliyun;
    const { bucket, host, region } = oss;
    const expire = Date.now() + 60 * 30 * 1000;
    const dir = '';
    const policyString = JSON.stringify({
        expiration: new Date(expire).toISOString(),
        conditions: [{ bucket }, ['content-length-range', 0, 1048576000 * 2], ['starts-with', '$key', dir]]
    });
    const policy = Buffer.from(policyString).toString('base64');
    const signature = crypto
        .createHmac('sha1', accessKeySecret)
        .update(policy)
        .digest('base64');

    return {
        policy,
        signature,
        accessid: accessKeyId,
        expire,
        host: host ? host : region,
        dir
    };
}
