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
import http from 'http';
import cwlog from 'chowa-log';
import config from '~/config';
import * as ScheduleJob from '~/schedule';
import MpModule from '~/module/mp';
import PcModule from '~/module/pc';
import NotifyModule from '~/module/notify';
import OaModule from '~/module/oa';
import wss from '~/wss';
import * as redisService from '~/service/redis';
import ModelMiddleware from '~/middleware/model';
import IpMiddleware from '~/middleware/ip';
import HeaderMiddleware from '~/middleware/header';
import WatcherMiddleware from '~/middleware/watcher';
import InitMiddleware from '~/middleware/init';
import * as iot from '~/iot';

if (cluster.isMaster) {
    cwlog.success(`main process ${process.pid}`);

    for (let i = 0; i < (process.env.NODE_ENV === 'production' ? os.cpus().length : 1); i++) {
        cluster.fork({ port: config.server.port + i });
    }
} else {
    const app = new Koa();
    const router = new KoaRouter();
    const server = http.createServer(app.callback());

    cwlog.setProject(`${config.name}-${process.pid}`);
    cwlog.displayDate();

    // schedule
    ScheduleJob.run();

    // modules
    MpModule(router);
    PcModule(router);
    NotifyModule(router);
    OaModule(router);

    // WebSocket
    wss.init(server);

    // for socket
    redisService.subscribe();

    // 物联网
    iot.init(router);

    app.use(KoaBodyMiddleware({ multipart: true }))
        .use(
            KoaLogMiddleware({
                transporter: str => {
                    cwlog.log(`${str}`);
                }
            })
        )
        .use(
            KoaSessionMilddleware(
                {
                    store: new MysqlSessionStore(),
                    ...config.session
                },
                app
            )
        )
        .use(ModelMiddleware())
        .use(IpMiddleware())
        .use(HeaderMiddleware())
        .use(InitMiddleware())
        .use(router.routes())
        .use(WatcherMiddleware());

    const port = process.env.port ? parseInt(process.env.port, 10) : config.server.port;

    server.listen(port, '0.0.0.0', () => {
        cwlog.success(`${config.name} server running on port ${port}，work process ${process.pid}`);
    });
}
