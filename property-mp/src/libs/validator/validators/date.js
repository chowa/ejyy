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
