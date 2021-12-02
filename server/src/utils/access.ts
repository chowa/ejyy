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

import * as crypto from './crypto';

import { SELF_ACCESS_CODE, VISTOR_ACCESS_CODE } from '~/constant/enter_access';

interface DecryptResult {
    id?: number;
    building_id?: number;
    type?: typeof SELF_ACCESS_CODE | typeof VISTOR_ACCESS_CODE;
    stamp?: number;
    success: boolean;
}

// 区分访客二维码和自己的二维码
// 访客二维码 id 为 vistor_id 自己的二维码为user_id
export function encrypt(
    id: number,
    building_id: number,
    type: typeof SELF_ACCESS_CODE | typeof VISTOR_ACCESS_CODE
): string {
    return crypto.encrypt(`${id}#${building_id}#${type}${Date.now()}`);
}

export function decrypt(uid: string): DecryptResult {
    const origin = crypto.decrypt(uid);

    if (!origin) {
        return { success: false };
    }

    const arr = origin.split('#');
    const id = parseInt(arr[0], 10);
    const building_id = parseInt(arr[1], 10);
    const type = <typeof SELF_ACCESS_CODE | typeof VISTOR_ACCESS_CODE>parseInt(arr[2], 10);
    const stamp = parseInt(arr[3], 10);
    let success = true;

    if (
        (type !== SELF_ACCESS_CODE && type !== VISTOR_ACCESS_CODE) ||
        building_id === NaN ||
        id === NaN ||
        !/^\d{13}$/.test(stamp.toString())
    ) {
        success = false;
    }

    return {
        id,
        building_id,
        type,
        stamp,
        success
    };
}
