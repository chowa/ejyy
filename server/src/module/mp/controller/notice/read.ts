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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { TRUE } from '~/constant/status';

interface RequestParams {
    id: number;
}

const MpNoticeReadAction = <Action>{
    router: {
        path: '/notice/read/:id',
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
        ],
        query: [
            {
                name: 'unread',
                required: true,
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { unread } = ctx.query;
        const { id } = <RequestParams>ctx.params;

        const data = await ctx.model
            .table('ejyy_notice_to_user')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_notice_to_user.community_id')
            .andWhere('ejyy_notice_to_user.id', id)
            .andWhere('ejyy_notice_to_user.published', TRUE)
            .select(
                'ejyy_notice_to_user.id',
                'ejyy_notice_to_user.title',
                'ejyy_notice_to_user.content',
                'ejyy_notice_to_user.refer',
                'ejyy_community_info.name as scope',
                'ejyy_notice_to_user.created_at'
            )
            .first();

        if (!data) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        if (parseInt(unread as string, 10) === 1) {
            const exit = await ctx.model
                .from('ejyy_notice_to_user_readed')
                .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                .andWhere('notice_id', id)
                .first();

            if (!exit) {
                await ctx.model.from('ejyy_notice_to_user_readed').insert({
                    notice_id: data.id,
                    wechat_mp_user_id: ctx.mpUserInfo.id,
                    created_at: Date.now()
                });
            }
        }

        ctx.body = {
            code: SUCCESS,
            data
        };
    }
};

export default MpNoticeReadAction;
