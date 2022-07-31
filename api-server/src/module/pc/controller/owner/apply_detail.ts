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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcOwerApplyDetailAction = <Action>{
    router: {
        path: '/owner/apply_detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_owner_apply')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_owner_apply.wechat_mp_user_id')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_owner_apply.replied_by')
            .where('ejyy_owner_apply.id', id)
            .andWhere('ejyy_owner_apply.community_id', community_id)
            .select(
                'ejyy_owner_apply.id',
                'ejyy_owner_apply.wechat_mp_user_id',
                'ejyy_owner_apply.community_name',
                'ejyy_owner_apply.house',
                'ejyy_owner_apply.carport',
                'ejyy_owner_apply.warehouse',
                'ejyy_owner_apply.subscribed',
                'ejyy_owner_apply.replied',
                'ejyy_owner_apply.replied_by',
                'ejyy_owner_apply.reply_content',
                'ejyy_owner_apply.replied_at',
                'ejyy_owner_apply.replied',
                'ejyy_owner_apply.content',
                'ejyy_owner_apply.success',
                'ejyy_owner_apply.created_at',
                'ejyy_wechat_mp_user.real_name',
                'ejyy_property_company_user.real_name as replied_real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取用户信息'
            });
        }

        let buildings = [];

        if (info.replied && info.success) {
            buildings = await ctx.model
                .from('ejyy_building_info')
                .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
                .where('ejyy_building_info.community_id', community_id)
                .andWhere('ejyy_user_building.wechat_mp_user_id', info.wechat_mp_user_id)
                .whereIn('ejyy_building_info.id', info.content)
                .select(
                    'ejyy_user_building.id',
                    'ejyy_user_building.building_id',
                    'ejyy_building_info.type',
                    'ejyy_building_info.area',
                    'ejyy_building_info.building',
                    'ejyy_building_info.unit',
                    'ejyy_building_info.number',
                    'ejyy_building_info.construction_area',
                    'ejyy_building_info.created_at',
                    'ejyy_user_building.authenticated',
                    'ejyy_user_building.authenticated_type',
                    'ejyy_user_building.status'
                );
        }

        delete info.content;

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                buildings
            }
        };
    }
};

export default PcOwerApplyDetailAction;
