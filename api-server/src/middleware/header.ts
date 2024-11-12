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

function HeaderMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx: DefaultContext, next) => {
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

        if (ctx.method == 'OPTIONS') {
            ctx.body = '';
            return (ctx.status = 204);
        }

        await next();
    };
}

export default HeaderMiddleware;
