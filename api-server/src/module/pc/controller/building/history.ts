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

const PcBuildingHistoryAction = <Action>{
    router: {
        path: '/building/history',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FCDA]
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
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_building_info')
            .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
            .where('ejyy_building_info.community_id', community_id)
            .andWhere('ejyy_user_building.id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法查询固定资产历史操作'
            });
        }

        const list = await ctx.model
            .from('ejyy_user_building_operate_log')
            .leftJoin(
                'ejyy_wechat_mp_user',
                'ejyy_wechat_mp_user.id',
                'ejyy_user_building_operate_log.wechat_mp_user_id'
            )
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_user_building_operate_log.property_company_user_id'
            )
            .where('ejyy_user_building_operate_log.user_building_id', id)
            .select(
                'ejyy_user_building_operate_log.status',
                'ejyy_user_building_operate_log.operate_by',
                'ejyy_user_building_operate_log.created_at',
                'ejyy_wechat_mp_user.id as ejyy_wechat_mp_user_id',
                'ejyy_wechat_mp_user.real_name as ejyy_wechat_mp_user_real_name',
                'ejyy_property_company_user.id as property_company_user_id',
                'ejyy_property_company_user.real_name as property_company_user_real_name'
            )
            .orderBy('ejyy_user_building_operate_log.id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcBuildingHistoryAction;
