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

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, QUESTIONNAIRE_HAS_ANSWERED } from '~/constant/code';
import { EjyyQuestionnaire, EjyyQuestion, EjyyQuestionOption } from '~/types/model';
import { SIGNLE_CHOICE, MULTIPLE_CHOICE } from '~/constant/questionnaire';

interface RequestParams {
    id: number;
}

interface Option {
    id: number;
    option_val: string;
}

interface Question {
    title: string;
    id: number;
    type: typeof SIGNLE_CHOICE | typeof MULTIPLE_CHOICE;
    options: Option[];
}

interface QuestionMap {
    [key: number]: Question;
}

type ModelType<T, K extends keyof T> = T[K];

interface ModelAs {
    question_title: ModelType<EjyyQuestion, 'title'>;
    option_id: ModelType<EjyyQuestionOption, 'id'>;
}

const MpQuestionnaireQuestionsAction = <Action>{
    router: {
        path: '/questionnaire/questions/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const answered = await ctx.model
            .from('ejyy_questionnaire_answer')
            .where('questionnaire_id', id)
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (answered) {
            return (ctx.body = {
                code: QUESTIONNAIRE_HAS_ANSWERED,
                message: '问卷已经提交过了'
            });
        }

        const records = <(EjyyQuestionnaire & EjyyQuestion & EjyyQuestionOption & ModelAs)[]>await ctx.model
            .from('ejyy_questionnaire')
            .leftJoin('ejyy_question', 'ejyy_question.questionnaire_id', 'ejyy_questionnaire.id')
            .leftJoin('ejyy_question_option', 'ejyy_question_option.question_id', 'ejyy_question.id')
            .where('ejyy_questionnaire.id', id)
            .select(
                'ejyy_questionnaire.title',
                'ejyy_questionnaire.expire',
                'ejyy_question.title as question_title',
                'ejyy_question.type',
                'ejyy_question_option.id as option_id',
                'ejyy_question_option.question_id',
                'ejyy_question_option.option_val'
            );

        if (records.length === 0) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的调查问卷'
            });
        }

        const map = <QuestionMap>{};

        records.forEach(({ question_id, question_title, type, option_id, option_val }) => {
            if (!(question_id in map)) {
                map[question_id] = {
                    title: question_title,
                    id: question_id,
                    type,
                    options: []
                };
            }

            map[question_id].options.push({
                id: option_id,
                option_val
            });
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                title: records[0].title,
                expire: records[0].expire,
                questions: Object.values(map)
            }
        };
    }
};

export default MpQuestionnaireQuestionsAction;
