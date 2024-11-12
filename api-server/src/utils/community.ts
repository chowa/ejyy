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

import * as crypto from './crypto';
import { AUTHENTICTED_BY_PROPERTY_COMPANY, AUTHENTICTED_BY_FAMILY } from '~/constant/authenticated_type';

interface DecodeResult {
    success: boolean;
    stamp?: number;
    authenticated_type?: typeof AUTHENTICTED_BY_PROPERTY_COMPANY | typeof AUTHENTICTED_BY_FAMILY;
    user_id?: number;
    building_ids?: number[];
}

interface EncodeResult {
    text: string;
    stamp: number;
}

// 中间13位时间戳
// 中间1位认证类型
// 后19位提供二维码用户的id
// 循环19位建筑id
// 最后8位混淆 共60

const dictionaries = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '~',
    '!',
    '@',
    '#',
    '$',
    '%',
    '&',
    '*'
];

function pad(num: number, len: number): string {
    const ret = [];

    for (let i = 0; i < len - num.toString().length; i++) {
        ret.push(dictionaries[Math.round(Math.random() * (dictionaries.length - 1))]);
    }

    ret.push(num);

    return ret.join('');
}

function unpad(str: string): number {
    const ret = [];

    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);

        if (char.match(/^\d$/)) {
            ret.push(char);
        }
    }

    return parseInt(ret.join(''), 10);
}

function fake(len: number): string {
    const ret = [];

    for (let i = 0; i < len; i++) {
        ret.push(dictionaries[Math.round(Math.random() * (dictionaries.length - 1))]);
    }

    return ret.join('');
}

export function encrypt(
    building_ids: number[],
    authenticated_type: typeof AUTHENTICTED_BY_PROPERTY_COMPANY | typeof AUTHENTICTED_BY_FAMILY,
    user_id: number
): EncodeResult {
    const stamp = Date.now();
    const ret = [stamp, authenticated_type, pad(user_id, 19)];

    building_ids.forEach(building_id => {
        ret.push(pad(building_id, 19));
    });

    ret.push(fake(8));

    return {
        text: crypto.encrypt(ret.join('')),
        stamp
    };
}

export function decrypt(text: string): DecodeResult {
    let str = crypto.decrypt(text);

    if (!str) {
        return { success: false };
    }

    const stamp = parseInt(str.substring(0, 13), 10);
    const authenticated_type = unpad(str.substring(13, 14)) as 2 | 3;
    const user_id = unpad(str.substring(14, 33));
    const building_ids = [];

    for (let i = 0; i < (str.length - 41) / 19; i++) {
        building_ids.push(unpad(str.substring(41 + i * 19, 41 + (i + 1) * 19)));
    }

    return {
        success: (str.length - 41) % 19 === 0,
        stamp,
        authenticated_type,
        user_id,
        building_ids
    };
}
