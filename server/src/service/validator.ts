/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Context } from 'koa';
import { ValidatorDeclare } from '~/types/action';
import config from '~/config';
import cwlog from 'chowa-log';

function validatorService(ctx: Context, validator: ValidatorDeclare): boolean {
    if (!validator) {
        return false;
    }

    return !['body', 'params', 'query', 'files'].every(refer => {
        const origin = validator[refer];

        if (!Array.isArray(origin)) {
            return true;
        }

        return origin.every(({ name, required, length, min, max, regex, validator }) => {
            let value = undefined;

            if (refer === 'params') {
                value = ctx.params[name];
            } else {
                value = ctx.request[refer][name];
            }

            if (
                required === true &&
                ((Array.isArray(value) && value.length === 0) ||
                    (!Array.isArray(value) && (value == undefined || value === '')))
            ) {
                if (config.debug) {
                    cwlog.warning(`${name} 字段必须`);
                }
                return false;
            }

            if (length && value && value.length !== length) {
                if (config.debug) {
                    cwlog.warning(`${name} 长度必须等于 ${length}，当前值：${value}`);
                }
                return false;
            }

            if (min && value && value.length < min) {
                if (config.debug) {
                    cwlog.warning(`${name} 长度必须小于 ${min}，当前值：${value}`);
                }
                return false;
            }

            if (max && value && value.length > max) {
                if (config.debug) {
                    cwlog.warning(`${name} 长度必须大于 ${max}，当前值：${value}`);
                }
                return false;
            }

            if (regex && value && !regex.test(value)) {
                if (config.debug) {
                    cwlog.warning(`${name} 必须满足正则 ${regex}，当前值：${value}`);
                }
                return false;
            }

            if (validator && value && !validator(value)) {
                if (config.debug) {
                    cwlog.warning(`${name} 自定义验证未通过，当前值：${value}`);
                }
                return false;
            }

            return true;
        });
    });
}

export default validatorService;
