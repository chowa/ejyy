/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { VISTOR_ACCESS_CODE } from '~/constant/enter_access';
import utils from '~/utils';

interface RequestParams {
    id: number;
}

const MpVistorUseAction = <Action>{
    router: {
        path: '/vistor/use/:id',
        method: 'get',
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
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ejyy_vistor')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_vistor.community_id')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_vistor.building_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_vistor.wechat_mp_user_id')
            .select(
                'ejyy_vistor.id',
                'ejyy_vistor.uid',
                'ejyy_vistor.expire',
                'ejyy_vistor.used_at',
                'ejyy_vistor.created_at',
                'ejyy_vistor.building_id',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_community_info.name as community_name',
                'ejyy_wechat_mp_user.avatar_url',
                'ejyy_wechat_mp_user.nick_name'
            )
            .where('ejyy_vistor.id', id)
            .first();

        const uid = utils.access.encrypt(detail.id, detail.building_id, VISTOR_ACCESS_CODE);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                uid
            }
        };
    }
};

export default MpVistorUseAction;
