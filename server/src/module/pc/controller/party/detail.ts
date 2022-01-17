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
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}

const PcPartyDetailAction = <Action>{
    router: {
        path: '/party/detail/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
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

        const detail = await ctx.model
            .from('ejyy_party')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_party.created_by')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_party.community_id')
            .where('ejyy_party.id', id)
            .select(
                'ejyy_party.id',
                'ejyy_party.title',
                'ejyy_party.cover_img',
                'ejyy_party.carousel',
                'ejyy_party.content',
                'ejyy_party.created_at',
                'ejyy_party.published',
                'ejyy_party.published_at',
                'ejyy_party.created_by',
                'ejyy_party.published_by',
                'ejyy_property_company_user.real_name',
                'ejyy_community_info.name as community_name'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的党建党讯'
            });
        }

        let published_real_name = null;

        if (detail.published_by) {
            const pInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', detail.published_by)
                .first();

            published_real_name = pInfo.real_name;
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                published_real_name
            }
        };
    }
};

export default PcPartyDetailAction;
