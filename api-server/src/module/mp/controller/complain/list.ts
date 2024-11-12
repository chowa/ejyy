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

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpComplainListAction = <Action>{
    router: {
        path: '/complain/list',
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
            .from('ejyy_complain')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_complain.community_id')
            .where('ejyy_complain.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_complain.id'))
            .select(
                'ejyy_complain.id',
                'ejyy_complain.type',
                'ejyy_complain.category',
                'ejyy_complain.description',
                'ejyy_complain.step',
                'ejyy_complain.merge_id',
                'ejyy_complain.created_at',
                'ejyy_community_info.name as community_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_complain.id', 'desc');

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

export default MpComplainListAction;
