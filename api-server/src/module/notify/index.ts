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

import path from 'path';
import { Context } from 'koa';
import { NotifyAction } from '~/types/action';
import KoaRouter from 'koa-router';
import * as NotifyModuleRouter from './router';
import cwlog from 'chowa-log';
import config from '~/config';

function MpModule(appRouter: KoaRouter) {
    for (const name in NotifyModuleRouter) {
        const { router, response } = <NotifyAction>NotifyModuleRouter[name];

        appRouter[router.method](path.posix.join('/notify', router.path), async (ctx: Context, next) => {
            await response.apply(this, [ctx, next]);
        });

        if (config.debug) {
            cwlog.info(
                `${name} mounted and request from ${path.posix.join('/notify', router.path)} by ${router.method}`
            );
        }
    }
}

export default MpModule;
