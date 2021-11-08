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
import { BINDING_BUILDING, FALSE, TRUE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';
import config from '~/config';

interface RequestBody {
    community_id: number;
    property_fee_id: number;
    user_id: number;
}

const PcPaymentPrepayAction = <Action>{
    router: {
        path: '/payment/prepay',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CWGL]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'property_fee_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'user_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { user_id, community_id, property_fee_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_user_building')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
            .where('ejyy_building_info.community_id', community_id)
            .andWhere('ejyy_user_building.status', BINDING_BUILDING)
            .andWhere('ejyy_user_building.wechat_mp_user_id', user_id)
            .whereNotIn('ejyy_user_building.building_id', function() {
                this.from('ejyy_property_fee')
                    .leftJoin(
                        'ejyy_property_fee_order',
                        'ejyy_property_fee_order.property_fee_id',
                        'ejyy_property_fee.id'
                    )
                    .leftJoin(
                        'ejyy_property_fee_order_item',
                        'ejyy_property_fee_order_item.property_fee_order_id',
                        'ejyy_property_fee_order.id'
                    )
                    .where('ejyy_property_fee.id', property_fee_id)
                    .andWhere('ejyy_property_fee.community_id', community_id)
                    .andWhere('ejyy_property_fee_order.cancel', FALSE)
                    .andWhere(function() {
                        this.where(function() {
                            this.where('ejyy_property_fee_order.paid', TRUE)
                                .andWhere('ejyy_property_fee_order_item.refund', FALSE)
                                .whereNull('ejyy_property_fee_order_item.refund_apply_at');
                        }).orWhere(function() {
                            this.where('ejyy_property_fee_order.paid', FALSE).andWhere(
                                'ejyy_property_fee_order.created_at',
                                '>=',
                                Date.now() - config.wechat.pay.payExpire
                            );
                        });
                    })
                    .select('ejyy_property_fee_order_item.building_id');
            })
            .select(
                'ejyy_building_info.community_id',
                'ejyy_building_info.id as building_id',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_building_info.construction_area'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcPaymentPrepayAction;
