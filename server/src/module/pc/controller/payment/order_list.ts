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
import * as ROLE from '~/constant/role_access';
import confirm from '~/config';
import {
    ORDER_CANCEL_STATUS,
    ORDER_SUCCESS_STATUS,
    ORDER_REFUNDING_STATUS,
    ORDER_REFUNDED_STATUS,
    ORDER_EXPIRED_STATUS,
    ORDER_NEED_PAY_STATUS
} from '~/constant/pay';
import { TRUE, FALSE } from '~/constant/status';
import config from '~/config';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    property_fee_id: number;
    no?: string;
    status?:
        | typeof ORDER_CANCEL_STATUS
        | typeof ORDER_SUCCESS_STATUS
        | typeof ORDER_REFUNDING_STATUS
        | typeof ORDER_REFUNDED_STATUS
        | typeof ORDER_EXPIRED_STATUS
        | typeof ORDER_NEED_PAY_STATUS;
}

const PcPaymentOrderListAction = <Action>{
    router: {
        path: '/payment/order_list',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CWGL]
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
                name: 'property_fee_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'no',
                min: '9',
                regex: /^\d+$/
            },
            {
                name: 'status',
                regex: /^1|2|3|4|5|6$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, property_fee_id, no, status } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_property_fee_order')
            .leftJoin('ejyy_property_fee', 'ejyy_property_fee.id', 'ejyy_property_fee_order.property_fee_id')
            .where('ejyy_property_fee.community_id', community_id)
            .andWhere('ejyy_property_fee_order.property_fee_id', property_fee_id)
            .andWhere(function() {
                if (status) {
                    switch (status) {
                        case ORDER_CANCEL_STATUS:
                            this.where('ejyy_property_fee_order.cancel', TRUE);
                            break;

                        case ORDER_SUCCESS_STATUS:
                            this.where('ejyy_property_fee_order.paid', TRUE);
                            break;

                        case ORDER_REFUNDING_STATUS:
                            this.where('ejyy_property_fee_order.refunding', TRUE).andWhere(
                                'ejyy_property_fee_order.refunded',
                                FALSE
                            );
                            break;

                        case ORDER_REFUNDED_STATUS:
                            this.where('ejyy_property_fee_order.refunding', TRUE).andWhere(
                                'ejyy_property_fee_order.refunded',
                                TRUE
                            );
                            break;

                        case ORDER_EXPIRED_STATUS:
                            this.where('ejyy_property_fee_order.cancel', FALSE)
                                .andWhere('ejyy_property_fee_order.paid', FALSE)
                                .andWhere('ejyy_property_fee_order.refunding', FALSE)
                                .andWhere('ejyy_property_fee_order.refunded', FALSE)
                                .where(
                                    'ejyy_property_fee_order.created_at',
                                    '<=',
                                    Date.now() - config.wechat.pay.payExpire
                                );
                            break;

                        case ORDER_NEED_PAY_STATUS:
                            this.where('ejyy_property_fee_order.cancel', FALSE)
                                .andWhere('ejyy_property_fee_order.paid', FALSE)
                                .andWhere('ejyy_property_fee_order.refunding', FALSE)
                                .andWhere('ejyy_property_fee_order.refunded', FALSE)
                                .andWhere(
                                    'ejyy_property_fee_order.created_at',
                                    '>',
                                    Date.now() - config.wechat.pay.payExpire
                                );
                            break;
                    }
                }
            })
            .andWhere(function() {
                if (no) {
                    this.where('ejyy_property_fee_order.id', no.substring(8));
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_property_fee_order.id'))
            .select(
                'ejyy_property_fee_order.id',
                'ejyy_property_fee_order.transaction_id',
                'ejyy_property_fee_order.paid',
                'ejyy_property_fee_order.refunded',
                'ejyy_property_fee_order.refunding',
                'ejyy_property_fee_order.cancel',
                'ejyy_property_fee_order.fee',
                'ejyy_property_fee_order.paid_fee',
                'ejyy_property_fee_order.is_cash',
                'ejyy_property_fee_order.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_property_fee_order.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size,
                payExpire: confirm.wechat.pay.payExpire
            }
        };
    }
};

export default PcPaymentOrderListAction;
