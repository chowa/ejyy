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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcQuestionnairePublishedAction = <Action>{
    router: {
        path: '/questionnaire/published',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WJDC],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_questionnaire')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail) {
            ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的调查问卷'
            };
        }

        if (detail.published === TRUE) {
            ctx.body = {
                code: STATUS_ERROR,
                message: '问卷已发布，不可发布'
            };
        }

        const published_at = Date.now();

        if (published_at > detail.expire) {
            ctx.body = {
                code: STATUS_ERROR,
                message: '问卷已逾期，不可发布'
            };
        }

        await ctx.model
            .from('ejyy_questionnaire')
            .where('id', id)
            .andWhere('community_id', community_id)
            .update({
                published: TRUE,
                published_at: Date.now()
            });

        ctx.body = {
            code: SUCCESS,
            message: '发布问卷成功',
            data: {
                published_at
            }
        };
    }
};

export default PcQuestionnairePublishedAction;
