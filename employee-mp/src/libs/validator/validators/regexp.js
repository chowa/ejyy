/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import rules from '../rules/index';
import { isEmptyValue } from '../util';

/**
 *  Validates the regular expression type.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
function regexp(rule, value, callback, source, options) {
    const errors = [];
    const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
    if (validate) {
        if (isEmptyValue(value) && !rule.required) {
            return callback();
        }
        rules.required(rule, value, source, errors, options);
        if (!isEmptyValue(value)) {
            rules.type(rule, value, source, errors, options);
        }
    }
    callback(errors);
}

export default regexp;
