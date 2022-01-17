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
import { TRUE } from '~/constant/status';

interface RequestParams {
    order_id: number;
}

const MpPaymentResultAction = <Action>{
    router: {
        path: '/payment/result/:order_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'order_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { order_id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ejyy_property_fee_order')
            .where('id', order_id)
            .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                result: detail.paid === TRUE && detail.transaction_id !== null
            }
        };
    }
};

export default MpPaymentResultAction;
