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
import { isEmptyValue } from '../util';

function type(rule, value, callback, source, options) {
    const ruleType = rule.type;
    const errors = [];
    const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
    if (validate) {
        if (isEmptyValue(value, ruleType) && !rule.required) {
            return callback();
        }
        rules.required(rule, value, source, errors, options, ruleType);
        if (!isEmptyValue(value, ruleType)) {
            rules.type(rule, value, source, errors, options);
        }
    }
    callback(errors);
}

export default type;
