/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, SUBMIT_EXCEED_LIMIT } from '~/constant/code';
import { FEEDBACK_OF_PROBLEM } from '~/constant/feedback';
import moment from 'moment';

interface RequestBody {
    subject: string;
    content: string;
}

const MpFeedbackProblemAction = <Action>{
    router: {
        path: '/feedback/problem',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'subject',
                required: true,
                min: 2
            },
            {
                name: 'content',
                required: true,
                min: 5
            }
        ]
    },
    response: async ctx => {
        const { subject, content } = <RequestBody>ctx.request.body;

        const beginStamp = moment()
            .startOf('day')
            .valueOf();
        const endStamp = moment()
            .endOf('day')
            .valueOf();

        const exist = await ctx.model
            .from('ejyy_feedback')
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('type', FEEDBACK_OF_PROBLEM)
            .andWhere('created_at', '>=', beginStamp)
            .andWhere('created_at', '<=', endStamp)
            .first();

        if (exist) {
            return (ctx.body = {
                code: SUBMIT_EXCEED_LIMIT,
                message: '今日已提交过问题反馈'
            });
        }

        const [id] = await ctx.model.from('ejyy_feedback').insert({
            subject,
            content,
            type: FEEDBACK_OF_PROBLEM,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            message: '问题反馈成功',
            data: {
                id
            }
        };
    }
};

export default MpFeedbackProblemAction;
