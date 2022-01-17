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

import schedule from 'node-schedule';
import moment from 'moment';
import Knex from 'knex';
import config from '~/config';
import { SESSION_JOB } from '~/constant/schedule';
import cwlog from 'chowa-log';

export default () => {
    schedule.scheduleJob('0 30 * * * *', async () => {
        const model = Knex({
            client: 'mysql',
            connection: config.mysqlConfig
        });

        cwlog.info('开始清理session store');

        const created_at = moment()
            .startOf('hour')
            .valueOf();
        const jobDone = await model
            .from('ejyy_schedule')
            .where('created_at', created_at)
            .where('job', SESSION_JOB)
            .first();

        if (jobDone) {
            return cwlog.info('已有进程清理，任务忽略');
        }

        await model.from('ejyy_schedule').insert({
            job: SESSION_JOB,
            created_at
        });

        await model
            .from('ejyy_session_store')
            .where('expire', '<', Date.now())
            .delete();

        cwlog.success('清理session store 完成');
    });
};
