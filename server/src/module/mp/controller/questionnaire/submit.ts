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
import { SUCCESS, QUESTIONNAIRE_HAS_ANSWERED } from '~/constant/code';
import { QuestionnaireStatistics } from '~/types/content';

interface Answer {
    id: number;
    options: number[];
}

interface RequestBody {
    questionnaire_id: number;
    answers: Answer[];
}

const MpQuestionnaireSubmitAction = <Action>{
    router: {
        path: '/questionnaire/submit',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'questionnaire_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'answers',
                required: true,
                validator: val => {
                    return val.every(item => {
                        return typeof item.id === 'number' && item.options.every(oid => typeof oid === 'number');
                    });
                }
            }
        ]
    },
    response: async ctx => {
        const { questionnaire_id, answers } = <RequestBody>ctx.request.body;

        const answered = await ctx.model
            .from('ejyy_questionnaire_answer')
            .where('questionnaire_id', questionnaire_id)
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (answered) {
            return (ctx.body = {
                code: QUESTIONNAIRE_HAS_ANSWERED,
                message: '问卷已经提交过了'
            });
        }

        const { content } = await ctx.model
            .from('ejyy_questionnaire_statistics')
            .where('questionnaire_id', questionnaire_id)
            .first();

        const statistics = content as QuestionnaireStatistics;
        statistics.total++;

        const [answer_id] = await ctx.model.from('ejyy_questionnaire_answer').insert({
            questionnaire_id,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            created_at: Date.now()
        });

        const result = [];

        answers.forEach(({ id: pid, options }) => {
            options.forEach(oid => {
                if (!statistics.options[oid]) {
                    statistics.options[oid] = 0;
                }

                statistics.options[oid]++;

                result.push({
                    answer_id,
                    question_id: pid,
                    option_id: oid
                });
            });
        });

        await ctx.model.from('ejyy_questionnaire_answer_result').insert(result);

        await ctx.model
            .from('ejyy_questionnaire_statistics')
            .update('content', JSON.stringify(statistics))
            .where('questionnaire_id', questionnaire_id);

        ctx.body = {
            code: SUCCESS,
            data: {
                id: questionnaire_id
            }
        };
    }
};

export default MpQuestionnaireSubmitAction;
