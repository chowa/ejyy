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

import path from 'path';
import { Context } from 'koa';
import { OaAction } from '~/types/action';
import KoaRouter from 'koa-router';
import * as OaModuleRouter from './router';
import cwlog from 'chowa-log';
import * as wechatService from '~/service/wechat';
import menu from './menu';
import config from '~/config';

async function OaModule(appRouter: KoaRouter) {
    for (const name in OaModuleRouter) {
        const { router, response } = <OaAction>OaModuleRouter[name];

        appRouter[router.method](path.posix.join('/oa', router.path), async (ctx: Context, next) => {
            await response.apply(this, [ctx, next]);
        });

        if (config.debug) {
            cwlog.info(`${name} mounted and request from ${path.posix.join('/oa', router.path)} by ${router.method}`);
        }
    }

    const { errmsg } = await wechatService.createOaMenu(menu);
    cwlog.info(`公众号菜单创建：${errmsg}`);
}

export default OaModule;
