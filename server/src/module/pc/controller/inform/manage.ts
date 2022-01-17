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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    published?: typeof TRUE | typeof FALSE;
    carousel: typeof TRUE | typeof FALSE;
}

const PcInformManageAction = <Action>{
    router: {
        path: '/inform/manage',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XZTZ],
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
            },
            {
                name: 'carousel',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, published, carousel } = <RequestBody>ctx.request.body;
        const where = {};

        if (published !== undefined) {
            where['ejyy_inform.published'] = published;
        }

        if (carousel !== undefined) {
            where['ejyy_inform.carousel'] = carousel;
        }

        const list = await ctx.model
            .from('ejyy_inform')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_inform.created_by')
            .where('ejyy_inform.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_inform.id'))
            .select(
                'ejyy_inform.id',
                'ejyy_inform.title',
                'ejyy_inform.carousel',
                'ejyy_inform.published',
                'ejyy_inform.published_at',
                'ejyy_inform.created_by',
                'ejyy_inform.created_at',
                'ejyy_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_inform.id', 'desc');

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

export default PcInformManageAction;
