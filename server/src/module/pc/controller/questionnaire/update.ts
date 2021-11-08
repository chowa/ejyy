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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';
import { SIGNLE_CHOICE, MULTIPLE_CHOICE, Question } from '~/constant/questionnaire';

interface RequestBody {
    community_id: number;
    id: number;
    title: string;
    published: typeof TRUE | typeof FALSE;
    expire: number;
    questions: Question[];
}

const PcQuestionnaireUpdateAction = <Action>{
    router: {
        path: '/questionnaire/update',
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
        const { id, community_id, title, published, expire, questions } = <RequestBody>ctx.request.body;

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
                message: '问卷已发布，不可修改'
            };
        }

        if (Date.now() > expire) {
            ctx.body = {
                code: STATUS_ERROR,
                message: '问卷已逾期，不可发布'
            };
        }

        await ctx.model
            .from('ejyy_question_option')
            .whereIn('question_id', function() {
                this.from('ejyy_question')
                    .where('questionnaire_id', id)
                    .select('id');
            })
            .delete();

        await ctx.model
            .from('ejyy_question')
            .where('questionnaire_id', id)
            .delete();

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

        await ctx.model
            .from('ejyy_questionnaire')
            .where('id', id)
            .andWhere('community_id', community_id)
            .update({
                title,
                published,
                expire,
                published_at: published ? Date.now() : null
            });

        ctx.body = {
            code: SUCCESS,
            message: '修改问卷成功'
        };
    }
};

export default PcQuestionnaireUpdateAction;
