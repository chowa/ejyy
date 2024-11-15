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

function date(rule, value, callback, source, options) {
    // console.log('integer rule called %j', rule);
    const errors = [];
    const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
    // console.log('validate on %s value', value);
    if (validate) {
        if (isEmptyValue(value, 'date') && !rule.required) {
            return callback();
        }
        rules.required(rule, value, source, errors, options);
        if (!isEmptyValue(value, 'date')) {
            let dateObject;

            if (value instanceof Date) {
                dateObject = value;
            } else {
                dateObject = new Date(value);
            }

            rules.type(rule, dateObject, source, errors, options);
            if (dateObject) {
                rules.range(rule, dateObject.getTime(), source, errors, options);
            }
        }
    }
    callback(errors);
}

export default date;
