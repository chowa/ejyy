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

import { Middleware, DefaultState, DefaultContext } from 'koa';

function IpMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        ctx.request.ip = (ctx.request.header['x-real-ip'] as string) || ctx.request.ip;

        await next();
    };
}

export default IpMiddleware;
