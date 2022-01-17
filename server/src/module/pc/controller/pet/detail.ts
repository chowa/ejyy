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
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const MpPcDetailAction = <Action>{
    router: {
        path: '/pet/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWDA],
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
            .from('ejyy_pet')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_pet.community_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_pet.wechat_mp_user_id')
            .select(
                'ejyy_pet.id',
                'ejyy_pet.wechat_mp_user_id',
                'ejyy_pet.name',
                'ejyy_pet.sex',
                'ejyy_pet.pet_type',
                'ejyy_pet.coat_color',
                'ejyy_pet.breed',
                'ejyy_pet.photo',
                'ejyy_pet.pet_license',
                'ejyy_pet.pet_license_award_at',
                'ejyy_community_info.name as community_name',
                'ejyy_pet.remove',
                'ejyy_pet.remove_reason',
                'ejyy_pet.removed_at',
                'ejyy_wechat_mp_user.real_name'
            )
            .where('ejyy_pet.id', id)
            .where('community_id', community_id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取宠物信息'
            });
        }

        const vaccinates = await ctx.model
            .from('ejyy_pet_vaccinate')
            .select('vaccinated_at', 'vaccine_type')
            .where('pet_id', id)
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                vaccinates
            }
        };
    }
};

export default MpPcDetailAction;
