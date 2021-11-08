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
import utils from '~/utils';

interface RequestParams {
    id: number;
}

const MpVistorDetailAction = <Action>{
    router: {
        path: '/vistor/detail/:id',
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
            .select(
                'ejyy_vistor.id',
                'ejyy_vistor.vistor_name',
                'ejyy_vistor.vistor_phone',
                'ejyy_vistor.car_number',
                'ejyy_vistor.uid',
                'ejyy_vistor.have_vistor_info',
                'ejyy_vistor.expire',
                'ejyy_vistor.used_at',
                'ejyy_vistor.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_community_info.name as community_name'
            )
            .select(ctx.model.raw('IF(ejyy_vistor.property_company_user_id, 1, 0) as check_in'))
            .where('ejyy_vistor.id', id)
            .where('ejyy_vistor.wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        detail.vistor_phone = utils.phone.hide(detail.vistor_phone);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail
            }
        };
    }
};

export default MpVistorDetailAction;
