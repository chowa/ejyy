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
import { TRUE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpNoticeReadedAction = <Action>{
    router: {
        path: '/notice/readed',
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
            .from('ejyy_notice_to_user')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_notice_to_user.community_id')
            .leftJoin('ejyy_notice_to_user_readed', 'ejyy_notice_to_user_readed.notice_id', 'ejyy_notice_to_user.id')
            .andWhere('ejyy_notice_to_user_readed.wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ejyy_notice_to_user.created_at', '>=', ctx.mpUserInfo.created_at)
            .whereNotNull('ejyy_notice_to_user_readed.wechat_mp_user_id')
            .andWhere('ejyy_notice_to_user.published', TRUE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_notice_to_user.id'))
            .select(
                'ejyy_notice_to_user.id',
                'ejyy_notice_to_user.title',
                'ejyy_notice_to_user.overview',
                'ejyy_notice_to_user.refer',
                'ejyy_community_info.name as scope',
                'ejyy_notice_to_user.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_notice_to_user.id', 'desc');

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

export default MpNoticeReadedAction;
