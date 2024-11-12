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

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpQuestionnaireUnansweredAction = <Action>{
    router: {
        path: '/questionnaire/unanswered',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_questionnaire')
            .leftJoin(
                'ejyy_user_default_community',
                'ejyy_user_default_community.community_id',
                'ejyy_questionnaire.community_id'
            )
            .where('ejyy_user_default_community.wechat_mp_user_id', ctx.mpUserInfo.id)
            .whereNotIn('ejyy_questionnaire.id', function() {
                this.from('ejyy_questionnaire_answer')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('questionnaire_id');
            })
            .andWhere('ejyy_questionnaire.created_at', '>=', ctx.mpUserInfo.created_at)
            .andWhere('ejyy_questionnaire.expire', '>', Date.now())
            .andWhere('ejyy_questionnaire.published', TRUE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_questionnaire.id'))
            .select(
                'ejyy_questionnaire.id',
                'ejyy_questionnaire.title',
                'ejyy_questionnaire.expire',
                'ejyy_questionnaire.published_at',
                'ejyy_questionnaire.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_questionnaire.id', 'desc');

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

export default MpQuestionnaireUnansweredAction;
