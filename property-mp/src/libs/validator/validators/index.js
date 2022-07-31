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

import string from './string';
import method from './method';
import number from './number';
import boolean from './boolean';
import regexp from './regexp';
import integer from './integer';
import float from './float';
import array from './array';
import object from './object';
import enumValidator from './enum';
import pattern from './pattern';
import date from './date';
import required from './required';
import type from './type';
import any from './any';

export default {
    string,
    method,
    number,
    boolean,
    regexp,
    integer,
    float,
    array,
    object,
    enum: enumValidator,
    pattern,
    date,
    url: type,
    hex: type,
    email: type,
    required,
    any
};
