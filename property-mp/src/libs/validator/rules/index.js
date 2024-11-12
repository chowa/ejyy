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

import required from './required';
import whitespace from './whitespace';
import type from './type';
import range from './range';
import enumRule from './enum';
import pattern from './pattern';

export default {
    required,
    whitespace,
    type,
    range,
    enum: enumRule,
    pattern
};
