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
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    published?: typeof TRUE | typeof FALSE;
}

const PcNoticeListAction = <Action>{
    router: {
        path: '/notice/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQTZ],
        verifyCommunity: true
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
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'published',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, published } = <RequestBody>ctx.request.body;
        const where = {};

        if (published !== undefined) {
            where['ejyy_notice_to_user.published'] = published;
        }

        const list = await ctx.model
            .from('ejyy_notice_to_user')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_notice_to_user.created_by')
            .where('ejyy_notice_to_user.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_notice_to_user.id'))
            .select(
                'ejyy_notice_to_user.id',
                'ejyy_notice_to_user.title',
                'ejyy_notice_to_user.published',
                'ejyy_notice_to_user.published_at',
                'ejyy_notice_to_user.notice_tpl_id',
                'ejyy_notice_to_user.created_by',
                'ejyy_notice_to_user.created_at',
                'ejyy_property_company_user.real_name'
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

export default PcNoticeListAction;
