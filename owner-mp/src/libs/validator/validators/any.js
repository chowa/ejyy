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

/**
 *  Performs validation for any type.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
function any(rule, value, callback, source, options) {
    const errors = [];
    const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
    if (validate) {
        if (isEmptyValue(value) && !rule.required) {
            return callback();
        }
        rules.required(rule, value, source, errors, options);
    }
    callback(errors);
}

export default any;
