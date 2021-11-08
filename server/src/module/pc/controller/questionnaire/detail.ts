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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { Question } from '~/constant/questionnaire';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

interface Option {
    id: number;
    option_val: string;
}

interface DetailQuestion extends Omit<Question, 'options'> {
    options: Option[];
}

interface QuestionMap {
    [key: number]: DetailQuestion;
}

const PcQuestionnaireDetailAction = <Action>{
    router: {
        path: '/questionnaire/detail',
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

        const info = await ctx.model
            .from('ejyy_questionnaire')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_questionnaire.created_by')
            .where('ejyy_questionnaire.id', id)
            .where('ejyy_questionnaire.community_id', community_id)
            .select(
                'ejyy_questionnaire.id',
                'ejyy_questionnaire.title',
                'ejyy_questionnaire.expire',
                'ejyy_questionnaire.published',
                'ejyy_questionnaire.published_at',
                'ejyy_questionnaire.created_at',
                'ejyy_property_company_user.id as user_id',
                'ejyy_property_company_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取问卷信息'
            });
        }

        const questions = await ctx.model
            .from('ejyy_question')
            .leftJoin('ejyy_question_option', 'ejyy_question_option.question_id', 'ejyy_question.id')
            .where('ejyy_question.questionnaire_id', id)
            .select(
                'ejyy_question.title as question_title',
                'ejyy_question.type',
                'ejyy_question_option.id as option_id',
                'ejyy_question_option.question_id',
                'ejyy_question_option.option_val'
            );

        const map = <QuestionMap>{};

        questions.forEach(({ question_id, question_title, type, option_id, option_val }) => {
            if (!(question_id in map)) {
                map[question_id] = {
                    title: question_title,
                    type,
                    options: []
                };
            }

            map[question_id].options.push({
                option_val,
                id: option_id
            });
        });

        const { content: statistics } = await ctx.model
            .from('ejyy_questionnaire_statistics')
            .where('questionnaire_id', id)
            .first();

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                questions: Object.values(map),
                statistics
            }
        };
    }
};

export default PcQuestionnaireDetailAction;
