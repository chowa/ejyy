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
import { SUCCESS, STATUS_ERROR, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { PROPERTY_COMPANY_CONFIRM_STEP } from '~/constant/fitment';

interface RequestBody {
    return_name: string;
    return_bank: string;
    return_bank_id: string;
}

interface RequestParams {
    id: number;
}

const MpFitmentReturnInfoAction = <Action>{
    router: {
        path: '/fitment/return_info/:id',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ],
        body: [
            {
                name: 'return_name',
                required: true,
                max: 12
            },
            {
                name: 'return_bank',
                required: true,
                max: 20
            },
            {
                name: 'return_bank_id',
                required: true,
                max: 30
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;
        const { return_name, return_bank, return_bank_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_fitment')
            .where('id', id)
            .first();

        if (!exist || (exist.step === PROPERTY_COMPANY_CONFIRM_STEP && exist.is_return_cash_deposit)) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '装修报备状态错误'
            });
        }

        const affect = await ctx.model
            .from('ejyy_fitment')
            .update({
                return_name,
                return_bank,
                return_bank_id
            })
            .where('id', id)
            .where('wechat_mp_user_id', ctx.mpUserInfo.id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '更新退还保证金账户信息失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '更新退还保证金账户信息成功'
        };
    }
};

export default MpFitmentReturnInfoAction;
