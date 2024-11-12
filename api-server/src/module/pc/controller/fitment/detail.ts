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
import { PROPERTY_COMPANY_ALLOW_STEP, PROPERTY_COMPANY_CONFIRM_STEP } from '~/constant/fitment';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcFitmentDetailAction = <Action>{
    router: {
        path: '/fitment/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZXDJ],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
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
        let agreeUserInfo = null;
        let confirmUserInfo = null;
        let reutrnUserInfo = null;

        const info = await ctx.model
            .from('ejyy_fitment')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_fitment.building_id')
            .leftJoin('ejyy_community_setting', 'ejyy_community_setting.community_id', 'ejyy_fitment.community_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_fitment.wechat_mp_user_id')
            .where('ejyy_fitment.community_id', community_id)
            .where('ejyy_fitment.id', id)
            .select(
                'ejyy_fitment.id',
                'ejyy_fitment.wechat_mp_user_id',
                'ejyy_fitment.step',
                'ejyy_fitment.agree_user_id',
                'ejyy_fitment.agreed_at',
                'ejyy_fitment.cash_deposit',
                'ejyy_fitment.finished_at',
                'ejyy_fitment.confirm_user_id',
                'ejyy_fitment.confirmed_at',
                'ejyy_fitment.return_name',
                'ejyy_fitment.return_bank',
                'ejyy_fitment.return_bank_id',
                'ejyy_fitment.return_operate_user_id',
                'ejyy_fitment.is_return_cash_deposit',
                'ejyy_fitment.returned_at',
                'ejyy_fitment.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_community_setting.fitment_pledge',
                'ejyy_wechat_mp_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取装修登记信息'
            });
        }

        if (info.step >= PROPERTY_COMPANY_ALLOW_STEP) {
            agreeUserInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.agree_user_id)
                .select('id', 'real_name')
                .first();
        }

        if (info.step === PROPERTY_COMPANY_CONFIRM_STEP) {
            confirmUserInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.confirm_user_id)
                .select('id', 'real_name')
                .first();

            if (info.return_operate_user_id) {
                reutrnUserInfo = await ctx.model
                    .from('ejyy_property_company_user')
                    .where('id', info.return_operate_user_id)
                    .select('id', 'real_name')
                    .first();
            }
        }

        delete info.agree_user_id;
        delete info.confirm_user_id;
        delete info.return_operate_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                agreeUserInfo,
                confirmUserInfo,
                reutrnUserInfo
            }
        };
    }
};

export default PcFitmentDetailAction;
