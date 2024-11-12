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
import config from '~/config';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcPaymentDetailAction = <Action>{
    router: {
        path: '/payment/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWGL],
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

        const info = await ctx.model
            .from('ejyy_property_fee')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_property_fee.created_by')
            .where('ejyy_property_fee.community_id', community_id)
            .where('ejyy_property_fee.id', id)
            .select(
                'ejyy_property_fee.id',
                'ejyy_property_fee.start_year',
                'ejyy_property_fee.end_year',
                'ejyy_property_fee.house_fee',
                'ejyy_property_fee.computed_house_fee_by_area',
                'ejyy_property_fee.carport_fee',
                'ejyy_property_fee.computed_carport_fee_by_area',
                'ejyy_property_fee.warehoure_fee',
                'ejyy_property_fee.computed_warehouse_fee_by_area',
                'ejyy_property_fee.merchant_fee',
                'ejyy_property_fee.computed_merchant_fee_by_area',
                'ejyy_property_fee.garage_fee',
                'ejyy_property_fee.computed_garage_fee_by_area',
                'ejyy_property_fee.wechat_push',
                'ejyy_property_fee.sms_push',
                'ejyy_property_fee.created_at',
                'ejyy_property_fee.created_by',
                'ejyy_property_company_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取物业收费信息'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...info,
                payExpire: config.wechat.pay.payExpire,
                refoundExpire: config.wechat.pay.refoundExpire
            }
        };
    }
};

export default PcPaymentDetailAction;
