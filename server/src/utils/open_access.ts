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
import { SELF_ACCESS_QRCODE, VISTOR_ACCESS_QRCODE } from '~/constant/open_access';

interface DecodeResult {
    id?: number;
    building_id?: number;
    type?: typeof SELF_ACCESS_QRCODE | typeof VISTOR_ACCESS_QRCODE;
    success: boolean;
}

// 区分访客二维码和自己的二维码
export function encode(
    id: number,
    building_id: number,
    type: typeof SELF_ACCESS_QRCODE | typeof VISTOR_ACCESS_QRCODE
): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
    let crypted = cipher.update(`${id}#${building_id}#${type}`, 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
}

export function decode(uid: string): DecodeResult {
    let origin = null;

    try {
        const cipher = crypto.createDecipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
        const decrypted = cipher.update(uid, 'hex', 'utf8');
        origin = decrypted + cipher.final('utf8');
    } catch (e) {
        return { success: false };
    }

    const arr = origin.split('#');
    const id = parseInt(arr[0], 10);
    const building_id = parseInt(arr[1], 10);
    const type = <typeof SELF_ACCESS_QRCODE | typeof VISTOR_ACCESS_QRCODE>parseInt(arr[2], 10);
    let success = true;

    if ((type !== SELF_ACCESS_QRCODE && type !== VISTOR_ACCESS_QRCODE) || building_id === NaN || id === NaN) {
        success = false;
    }

    return {
        id,
        building_id,
        type,
        success
    };
}
