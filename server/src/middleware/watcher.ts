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

import { Middleware, DefaultState, DefaultContext } from 'koa';
import utils from '~/utils';
import cwlog from 'chowa-log';
import config from '~/config';

function WatcherMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        try {
            await next();
        } catch (error) {
            ctx.status = 500;

            if (config.debug) {
                cwlog.error('===============错误捕捉开始=================');
                console.log(error);
                cwlog.error('===============错误捕捉结束=================');
            } else {
                utils.mail.send({
                    to: config.smtp.to,
                    subject: `${config.name}异常捕获`,
                    content: [
                        `访问地址：${ctx.request.path}`,
                        `进程号：${process.pid}`,
                        `body参数： ${JSON.stringify(ctx.request.body)}`,
                        `params参数： ${JSON.stringify(ctx.params)}`,
                        `进程号：${process.pid}`,
                        `错误原因：${error}`
                    ]
                });
            }
        }

        if (ctx.status === 404) {
            ctx.redirect('https://www.chowa.cn');
        }
    };
}

export default WatcherMiddleware;
