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
import * as ROLE from '~/constant/role_access';
import { FALSE, TRUE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    success?: typeof FALSE | typeof TRUE;
    community_id: number;
}

const PcRefoundMyAction = <Action>{
    router: {
        path: '/refound/my',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'success',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, success } = <RequestBody>ctx.request.body;
        const where = {};

        if (success !== undefined) {
            where['success'] = success;
        }

        const list = await ctx.model
            .from('ejyy_refound')
            .where('created_by', ctx.pcUserInfo.id)
            .andWhere('community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'begin_date', 'finish_date', 'reason', 'total', 'success', 'cancel', 'created_at')
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcRefoundMyAction;
