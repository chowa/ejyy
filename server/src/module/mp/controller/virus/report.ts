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

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE } from '~/constant/status';

// 新版废弃，移动到home main下
const MpVirusReportAction = <Action>{
    router: {
        path: '/virus/report',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },

    response: async ctx => {
        const record = await ctx.model
            .from('ejyy_virus')
            .where('success', TRUE)
            .orderBy('id', 'desc')
            .first();

        ctx.body = {
            code: SUCCESS,
            data: record.content
        };
    }
};

export default MpVirusReportAction;
