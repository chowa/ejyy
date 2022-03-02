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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}
interface RequestBody {
    vaccinated_at: number;
    vaccine_type: string;
}

const PcPetVaccinateAction = <Action>{
    router: {
        path: '/pet/vaccinate/:id',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWDA],
        verifyCommunity: true
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
                name: 'vaccinated_at',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'vaccine_type',
                required: true,
                max: 32
            },
            // todo 此处有问题
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;
        const { vaccinated_at, vaccine_type } = <RequestBody>ctx.request.body;

        const [aid] = await ctx.model.from('ejyy_pet_vaccinate').insert({
            vaccinated_at,
            vaccine_type,
            pet_id: id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id: aid
            }
        };
    }
};

export default PcPetVaccinateAction;
