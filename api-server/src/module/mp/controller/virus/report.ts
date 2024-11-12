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
