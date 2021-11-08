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
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';
import { SIGNLE_CHOICE, MULTIPLE_CHOICE, Question } from '~/constant/questionnaire';
import { QuestionnaireStatistics } from '~/types/content';

interface RequestBody {
    community_id: number;
    title: string;
    published: typeof TRUE | typeof FALSE;
    expire: number;
    questions: Question[];
}

const PcQuestionnaireCreateAction = <Action>{
    router: {
        path: '/questionnaire/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WJDC],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'title',
                required: true,
                max: 128
            },
            {
                name: 'published',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'expire',
                required: true,
                regex: /^\d{13}$/,
                validator: val => val > Date.now()
            },
            {
                name: 'questions',
                required: true,
                min: 1,
                validator: (val: Question[]) =>
                    Array.isArray(val) &&
                    val.every(item => {
                        if (typeof item !== 'object' || !item.title || item.title.length >= 128) return false;

                        if (item.type !== SIGNLE_CHOICE && item.type !== MULTIPLE_CHOICE) return false;

                        return (
                            Array.isArray(item.options) &&
                            item.options.length >= 2 &&
                            item.options.every(opt => opt.length < 128)
                        );
                    })
            }
        ]
    },
    response: async ctx => {
        const { community_id, title, published, expire, questions } = <RequestBody>ctx.request.body;

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_questionnaire').insert({
            community_id,
            title,
            expire,
            published,
            published_at: published ? created_at : null,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        // mysql 低版本不支持批量返回ids
        for (let quesiton of questions) {
            const optionsData = [];
            const [question_id] = await ctx.model.from('ejyy_question').insert({
                title: quesiton.title,
                type: quesiton.type,
                questionnaire_id: id
            });

            quesiton.options.forEach(option_val => {
                optionsData.push({
                    option_val,
                    question_id
                });
            });
            await ctx.model.from('ejyy_question_option').insert(optionsData);
        }

        await ctx.model.from('ejyy_questionnaire_statistics').insert({
            questionnaire_id: id,
            content: JSON.stringify({
                total: 0,
                options: {}
            } as QuestionnaireStatistics)
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcQuestionnaireCreateAction;
