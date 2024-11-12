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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcEpidemicDetailAction = <Action>{
    router: {
        path: '/epidemic/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YQFK],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_epidemic')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_epidemic.building_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_epidemic.wechat_mp_user_id')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_epidemic.created_by')
            .where('ejyy_epidemic.id', id)
            .andWhere('ejyy_epidemic.community_id', community_id)
            .select(
                'ejyy_epidemic.id',
                'ejyy_epidemic.building_id',
                'ejyy_epidemic.tour_code',
                'ejyy_epidemic.wechat_mp_user_id',
                'ejyy_epidemic.temperature',
                'ejyy_epidemic.return_hometown',
                'ejyy_epidemic.return_from_province',
                'ejyy_epidemic.return_from_city',
                'ejyy_epidemic.return_from_district',
                'ejyy_epidemic.created_by',
                'ejyy_epidemic.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_wechat_mp_user.real_name as user_real_name',
                'ejyy_property_company_user.real_name as created_user_real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法查询疫情防控数据'
            });
        }
        ctx.body = {
            code: SUCCESS,
            data: {
                info
            }
        };
    }
};

export default PcEpidemicDetailAction;
