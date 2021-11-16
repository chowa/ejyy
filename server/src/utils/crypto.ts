/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import crypto from 'crypto';
import config from '~/config';

export function md5(str: string, upperCase = false): string {
    const hash = crypto.createHash('md5');

    hash.update(str, 'utf8');

    const ret = hash.digest('hex');

    return upperCase ? ret.toUpperCase() : ret;
}

export function encrypt(str: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
    let crypted = cipher.update(str, 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
}

export function decrypt(str: string): string {
    let result = null;

    try {
        const cipher = crypto.createDecipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
        const decrypted = cipher.update(str, 'hex', 'utf8');
        result = decrypted + cipher.final('utf8');
    } catch (e) {
        return result;
    }

    return result;
}
