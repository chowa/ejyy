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
import config from '~/config';
import utils from '~/utils';
import { TRUE } from '~/constant/status';
import { SYSTEMT_NOT_INIT } from '~/constant/code';

function InitMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx: DefaultContext, next) => {
        const isInitAction = /^\/pc\/init\/\w+$/.test(ctx.request.path);

        if (!config.inited && !/^\/pc\/upload\/sign$/.test(ctx.request.path)) {
            const total = utils.sql.countReader(
                await ctx.model
                    .from('ejyy_property_company_user')
                    .where('admin', TRUE)
                    .count()
            );

            if (total === 0) {
                if (!isInitAction) {
                    return (ctx.body = {
                        code: SYSTEMT_NOT_INIT,
                        message: '系统未初始化'
                    });
                }
            } else {
                config.inited = true;
            }
        } else {
            if (isInitAction) {
                ctx.redirect('https://www.chowa.cn');
            }
        }

        await next();
    };
}

export default InitMiddleware;
