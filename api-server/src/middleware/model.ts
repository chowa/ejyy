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

import { Middleware, DefaultState, DefaultContext } from 'koa';
import Knex from 'knex';
import model from '~/model';

declare module 'koa' {
    interface BaseContext {
        model: Knex;
    }
}

function ModelMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        ctx.model = model;

        await next();
    };
}

export default ModelMiddleware;
