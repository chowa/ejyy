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

import { Context } from 'koa';
import { ValidatorDeclare, FieldVerifyDeclare } from '~/types/action';

interface ValidatorResult {
    success: boolean;
    message?: string;
}

interface FieldVeirfy extends FieldVerifyDeclare {
    value: any;
}

function validatorService(ctx: Context, validatorDeclare: ValidatorDeclare): ValidatorResult {
    if (!validatorDeclare) {
        return { success: true };
    }

    const fileds: FieldVeirfy[] = [];

    ['body', 'params', 'query', 'files'].forEach((refer: 'body' | 'params' | 'query' | 'files') => {
        if (!Array.isArray(validatorDeclare[refer])) {
            return;
        }

        validatorDeclare[refer].forEach(declare => {
            fileds.push({
                value: refer === 'params' ? ctx.params[declare.name] : ctx.request[refer][declare.name],
                ...declare
            });
        });
    });

    for (let i = 0; i < fileds.length; i++) {
        const { name, required, length, min, max, regex, validator, value, message } = fileds[i];

        if (
            required === true &&
            ((Array.isArray(value) && value.length === 0) ||
                (!Array.isArray(value) && (value == undefined || value === '')))
        ) {
            return {
                success: false,
                message: message ? message : `参数错误，${name}字段是必填字段`
            };
        }

        if (length && value && value.length !== length) {
            return {
                success: false,
                message: message ? message : `参数错误，${name}字段长度必须等于 ${length}`
            };
        }

        if (min && value && value.length < min) {
            return {
                success: false,
                message: message ? message : `参数错误，${name}字段长度必须大于 ${min}`
            };
        }

        if (max && value && value.length > max) {
            return {
                success: false,
                message: message ? message : `参数错误，${name}字段长度必须小于 ${max}`
            };
        }

        if (regex && value && !regex.test(value)) {
            return {
                success: false,
                message: message ? message : `参数错误，${name}字段必须满足正则 ${regex}`
            };
        }

        if (validator && value && !validator(value)) {
            return {
                success: false,
                message: message ? message : `参数错误，${name}字段验证未通过`
            };
        }
    }

    return { success: true };
}

export default validatorService;
