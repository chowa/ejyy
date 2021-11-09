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

import { Middleware, DefaultState, DefaultContext } from 'koa';

function IpMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        ctx.request.ip = (ctx.request.header['x-real-ip'] as string) || ctx.request.ip;

        await next();
    };
}

export default IpMiddleware;
