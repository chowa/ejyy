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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';

interface RequestParams {
    id: number;
}
interface RequestBody {
    pet_license: string;
    pet_license_award_at: number;
}

const MpPetLicenseAction = <Action>{
    router: {
        path: '/pet/license/:id',
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
                name: 'pet_license',
                required: true,
                max: 40
            },
            {
                name: 'pet_license_award_at',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;
        const { pet_license, pet_license_award_at } = <RequestBody>ctx.request.body;

        const affect = await ctx.model
            .from('ejyy_pet')
            .update({ pet_license, pet_license_award_at })
            .where('id', id)
            .where('wechat_mp_user_id', ctx.mpUserInfo.id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '设置宠物登记证件失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '设置宠物登记证件成功'
        };
    }
};

export default MpPetLicenseAction;
