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

import rules from '../rules/index';

function required(rule, value, callback, source, options) {
    const errors = [];
    const type = Array.isArray(value) ? 'array' : typeof value;
    rules.required(rule, value, source, errors, options, type);
    callback(errors);
}

export default required;
