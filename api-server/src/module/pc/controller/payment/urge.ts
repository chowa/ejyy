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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import * as feeService from '~/service/fee';

interface RequestBody {
    community_id: number;
    property_fee_id: number;
    building_id: number;
    type: 'oa' | 'sms';
}

const PcPaymentUrgeAction = <Action>{
    router: {
        path: '/payment/urge',
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
                name: 'building_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'type',
                regex: /^oa|sms$/
            }
        ]
    },
    response: async ctx => {
        const { building_id, community_id, property_fee_id, type } = <RequestBody>ctx.request.body;

        let res: feeService.SendResult;

        if (type === 'oa') {
            res = await feeService.oaUrge(ctx.model, community_id, property_fee_id, building_id);
        } else {
            res = await feeService.smsUrge(ctx.model, community_id, property_fee_id, building_id);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...res
            }
        };
    }
};

export default PcPaymentUrgeAction;
