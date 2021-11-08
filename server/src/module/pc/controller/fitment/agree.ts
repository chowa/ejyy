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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { USER_SUBMIT_APPLY_STEP, PROPERTY_COMPANY_ALLOW_STEP } from '~/constant/fitment';

interface RequestBody {
    id: number;
    community_id: number;
    cash_deposit?: number;
    return_name?: string;
    return_bank?: string;
    return_bank_id?: string;
}

const PcFitmentAgreeAction = <Action>{
    router: {
        path: '/fitment/agree',
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
            },
            {
                name: 'cash_deposit',
                regex: /^\d+$/
            },
            {
                name: 'return_name',
                max: 12
            },
            {
                name: 'return_bank',
                max: 20
            },
            {
                name: 'return_bank_id',
                max: 30
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, cash_deposit, return_name, return_bank, return_bank_id } = <RequestBody>(
            ctx.request.body
        );

        const agreed_at = Date.now();

        const affect = await ctx.model
            .from('ejyy_fitment')
            .update({
                cash_deposit: cash_deposit ? cash_deposit : null,
                return_name: return_name ? return_name : null,
                return_bank: return_bank ? return_bank : null,
                return_bank_id: return_bank_id ? return_bank_id : null,
                agree_user_id: ctx.pcUserInfo.id,
                agreed_at,
                step: PROPERTY_COMPANY_ALLOW_STEP
            })
            .where('community_id', community_id)
            .andWhere('step', USER_SUBMIT_APPLY_STEP)
            .andWhere('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '同意装修申请失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '同意装修申请成功',
            data: {
                agreed_at,
                agreeUserInfo: {
                    id: ctx.pcUserInfo.id,
                    real_name: ctx.pcUserInfo.real_name
                }
            }
        };
    }
};

export default PcFitmentAgreeAction;
