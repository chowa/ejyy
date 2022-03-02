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

function required(rule, value, callback, source, options) {
    const errors = [];
    const type = Array.isArray(value) ? 'array' : typeof value;
    rules.required(rule, value, source, errors, options, type);
    callback(errors);
}

export default required;
