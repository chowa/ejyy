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

import 'module-alias/register';
import cluster from 'cluster';
import os from 'os';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBodyMiddleware from 'koa-body';
import KoaSessionMilddleware from 'koa-session';
import KoaLogMiddleware from 'koa-logger';
import MysqlSessionStore from '~/store/mysql-session';
import Knex from 'knex';
import WebSocket from 'ws';
import * as redisService from '~/service/redis';
import http from 'http';
import cwlog from 'chowa-log';
import config from '~/config';
import * as ScheduleJob from '~/schedule';
import MpModule from '~/module/mp';
import PcModule from '~/module/pc';
import NotifyModule from '~/module/notify';
import OaModule from '~/module/oa';
import utils from '~/utils';
import { SYSTEMT_NOT_INIT } from '~/constant/code';

if (cluster.isMaster) {
    cwlog.success(`main process ${process.pid}`);

    for (let i = 0; i < (process.env.NODE_ENV === 'production' ? os.cpus().length : 1); i++) {
        cluster.fork({ port: config.server.port + i });
    }
} else {
    const app = new Koa();
    const router = new KoaRouter();
    const server = http.createServer(app.callback());
    const wss = new WebSocket.Server({ server, path: '/cws' });
    const model = Knex({
        client: 'mysql',
        connection: config.mysqlConfig,
        pool: {
            min: 0,
            max: 200
        }
    });
    console.log(config);
    cwlog.setProject(`${config.name}-${process.pid}`);
    cwlog.displayDate();

    // schedule
    ScheduleJob.run();

    // modules
    MpModule(router);
    PcModule(router);
    NotifyModule(router);
    OaModule(router);

    // for socket
    redisService.subscribe(model, wss);

    app.use(KoaBodyMiddleware({ multipart: true }));
    app.use(
        KoaLogMiddleware({
            transporter: str => {
                cwlog.log(`${str}`);
            }
        })
    );
    app.use(
        KoaSessionMilddleware(
            {
                store: new MysqlSessionStore(model),
                ...config.session
            },
            app
        )
    );
    app.use(async (ctx, next) => {
        ctx.model = model;
        ctx.request.ip = (ctx.request.header['x-real-ip'] as string) || ctx.request.ip;

        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

        if (ctx.method == 'OPTIONS') {
            ctx.body = '';
            ctx.status = 204;
        } else {
            const isInitAction = /^\/pc\/init\/\w+$/.test(ctx.request.path);

            if (!config.inited && !/^\/pc\/upload\/sign$/.test(ctx.request.path)) {
                const total = utils.sql.countReader(await ctx.model.from('ejyy_property_company_admin').count());

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
                        subject: `错误捕获`,
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
        }

        if (ctx.status === 404) {
            ctx.redirect('https://www.chowa.cn');
        }
    });
    app.use(router.routes());

    const port = process.env.port ? parseInt(process.env.port, 10) : config.server.port;

    server.listen(port, '0.0.0.0', () => {
        cwlog.success(`${config.name} server running on port ${port}，work process ${process.pid}`);
    });
}
