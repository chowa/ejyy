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
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    published: typeof TRUE | typeof FALSE;
    expired: typeof TRUE | typeof FALSE;
}

const PcQuestionnaireListAction = <Action>{
    router: {
        path: '/questionnaire/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WJDC],
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
                name: 'published',
                regex: /^0|1$/
            },
            {
                name: 'expired',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, expired, published } = <RequestBody>ctx.request.body;
        const where = {};

        if (published !== undefined) {
            where['published'] = published;
        }

        const list = await ctx.model
            .from('ejyy_questionnaire')
            .where('community_id', community_id)
            .andWhere(where)
            .andWhere(function() {
                if (expired !== undefined) {
                    if (expired) {
                        this.where('expire', '<=', Date.now());
                    } else {
                        this.where('expire', '>', Date.now());
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'title', 'published', 'created_at', 'published_at', 'expire')
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

export default PcQuestionnaireListAction;
