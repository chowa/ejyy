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

import path from 'path';
import crypto from 'crypto';
import RawBody from 'raw-body';
import KoaRouter from 'koa-router';
import { Context } from 'koa';
import { Action } from '~/types/action';
import { IOT_ENTRANCE_ILLEGAL, PARAMS_ERROR, IOT_SECRET_ERROR } from '~/constant/code';
import validatorService from '~/service/validator';
import statusMethod from './status';
import accessMethod from './access';
import config from '~/config';
import cwlog from 'chowa-log';

function zeroPad(str: string, length = 8): string {
    str = Buffer.from(str, 'utf8').toString('hex');
    const bitLength = str.length * length;
    if (bitLength < 256) {
        for (let i = bitLength; i < 256; i += length) {
            str += 0;
        }
    } else if (bitLength > 256) {
        while ((str.length * length) % 256 != 0) {
            str += 0;
        }
    }
    return Buffer.from(str, 'hex').toString('utf8');
}

function encrypt(str: string, secret: string): string {
    const cipher = crypto.createCipheriv('aes-128-ecb', secret, '');

    cipher.setAutoPadding(false);

    let crypted = cipher.update(zeroPad(str), 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
}

function decrypt(str: string, secret: string): string {
    const cipher = crypto.createDecipheriv('aes-128-ecb', secret, '');
    const isBase64 = Buffer.from(str, 'base64').toString('base64') === str;

    cipher.setAutoPadding(false);

    let decrypted = cipher.update(zeroPad(str), isBase64 ? 'base64' : 'hex', 'utf8');
    decrypted = decrypted + cipher.final('utf8');

    return decrypted.replace(/[\u0000-\u0019]+/g, '');
}

const IotEntranceAction = <Action>{
    router: {
        path: '/entrance',
        method: 'post',
        authRequired: false
    },
    validator: {
        query: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'method',
                required: true,
                regex: /^status|access$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, id, method } = ctx.request.query;

        const entranceInfo = await ctx.model
            .from('ejyy_iot_entrance')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!entranceInfo) {
            return (ctx.body = {
                code: IOT_ENTRANCE_ILLEGAL,
                message: '非法的物联网门禁'
            });
        }

        const raw = await RawBody(ctx.req, {
            length: ctx.request.length,
            limit: '1mb',
            encoding: ctx.request.charset || 'utf-8'
        });

        const datas = raw.replace('DATAS=', '');

        if (!datas) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: '物联网门禁受控参数错误'
            });
        }

        let decrypted = null;

        try {
            decrypted = decrypt(datas, entranceInfo.secret);
        } catch (e) {
            return (ctx.bod = {
                code: IOT_SECRET_ERROR,
                message: '物联网门禁秘钥错误'
            });
        }

        let params = null;

        try {
            params = JSON.parse(decrypted);
        } catch (e) {
            return (ctx.body = {
                code: IOT_SECRET_ERROR,
                message: '物联网门禁秘钥错误'
            });
        }

        if (!('Serial' in params) || !('ID' in params)) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: '物联网门禁控制参数错误'
            });
        }

        if (params.ID !== entranceInfo.sign) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: '物联网门禁自定义标识符配置错误'
            });
        }

        let res = {};
        console.log(params);
        switch (method) {
            // 心跳
            case 'status':
                res = await statusMethod(params, entranceInfo);
                break;

            // 开门
            case 'access':
                res = await accessMethod(params, entranceInfo, ctx.model);
                break;

            default:
        }

        ctx.res.setHeader('Content-Type', 'text/html');
        ctx.body = `DATAS={${encrypt(JSON.stringify(res), entranceInfo.secret)}}`;
    }
};

export default (appRouter: KoaRouter) => {
    const { router, validator, response } = IotEntranceAction;

    appRouter[router.method](path.posix.join('/iot', router.path), async (ctx: Context, next) => {
        const vs = validatorService(ctx, validator);

        if (!vs.success) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: vs.message
            });
        }

        await response.apply(this, [ctx, next]);
    });

    if (config.debug) {
        cwlog.info(`IotEntrance mounted and request from ${path.posix.join('/iot', router.path)} by ${router.method}`);
    }
};
