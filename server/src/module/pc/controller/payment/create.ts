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
import { SUCCESS, PARAMS_ERROR, STATUS_ERROR } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import moment from 'moment';
import * as ROLE from '~/constant/role_access';
import * as feeService from '~/service/fee';

interface RequestBody {
    community_id: number;
    start_year: number;
    end_year: number;
    house_fee: number;
    computed_house_fee_by_area: typeof TRUE | typeof FALSE;
    carport_fee: number;
    computed_carport_fee_by_area: typeof TRUE | typeof FALSE;
    warehoure_fee: number;
    computed_warehouse_fee_by_area: typeof TRUE | typeof FALSE;
    merchant_fee: number;
    computed_merchant_fee_by_area: typeof TRUE | typeof FALSE;
    garage_fee: number;
    computed_garage_fee_by_area: typeof TRUE | typeof FALSE;
    wechat_push: typeof TRUE | typeof FALSE;
    sms_push: typeof TRUE | typeof FALSE;
}

const PcPaymentCreateAction = <Action>{
    router: {
        path: '/payment/create',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CWGL]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'start_year',
                required: true,
                regex: /^\d+$/,
                validator: val => val >= moment().format('YYYY')
            },
            {
                name: 'end_year',
                required: true,
                regex: /^\d+$/,
                validator: val => val > moment().format('YYYY')
            },
            {
                name: 'house_fee',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'computed_house_fee_by_area',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'carport_fee',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'computed_carport_fee_by_area',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'warehoure_fee',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'computed_warehouse_fee_by_area',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'merchant_fee',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'computed_merchant_fee_by_area',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'garage_fee',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'computed_garage_fee_by_area',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'wechat_push',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'sms_push',
                required: true,
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const {
            community_id,
            start_year,
            end_year,
            house_fee,
            computed_house_fee_by_area,
            carport_fee,
            computed_carport_fee_by_area,
            warehoure_fee,
            computed_warehouse_fee_by_area,
            merchant_fee,
            computed_merchant_fee_by_area,
            garage_fee,
            computed_garage_fee_by_area,
            wechat_push,
            sms_push
        } = <RequestBody>ctx.request.body;

        if (start_year >= end_year) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: '起始年份应该大于结束年份'
            });
        }

        const exist = await ctx.model
            .from('ejyy_property_fee')
            .where('community_id', community_id)
            .andWhere(function() {
                this.where('start_year', start_year).orWhere('end_year', end_year);
            })
            .first();

        if (exist) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '存在重复收费记录，请调整起始结束年份后重试'
            });
        }

        const [id] = await ctx.model.from('ejyy_property_fee').insert({
            community_id,
            start_year,
            end_year,
            house_fee,
            computed_house_fee_by_area,
            carport_fee,
            computed_carport_fee_by_area,
            warehoure_fee,
            computed_warehouse_fee_by_area,
            merchant_fee,
            computed_merchant_fee_by_area,
            garage_fee,
            computed_garage_fee_by_area,
            wechat_push,
            sms_push,
            created_by: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        if (wechat_push) {
            feeService.oaBroadcast(ctx.model, community_id, id);
        }

        if (sms_push) {
            feeService.smsBroadcast(ctx.model, community_id, id);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcPaymentCreateAction;
