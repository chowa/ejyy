/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { VISTOR_ACCESS_CODE } from '~/constant/enter_access';
import utils from '~/utils';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcVistorDetailAction = <Action>{
    router: {
        path: '/vistor/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FKTX],
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
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;
        let registrant = null;

        const info = await ctx.model
            .from('ejyy_vistor')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_vistor.building_id')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_vistor.scan_by')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_vistor.wechat_mp_user_id')
            .select(
                'ejyy_vistor.id',
                'ejyy_vistor.vistor_name',
                'ejyy_vistor.vistor_phone',
                'ejyy_vistor.car_number',
                'ejyy_vistor.have_vistor_info',
                'ejyy_vistor.scan_by',
                'ejyy_vistor.building_id',
                'ejyy_vistor.property_company_user_id',
                'ejyy_vistor.wechat_mp_user_id as ower_id',
                'ejyy_wechat_mp_user.real_name as ower_name',
                'ejyy_vistor.uid',
                'ejyy_vistor.expire',
                'ejyy_vistor.used_at',
                'ejyy_vistor.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_property_company_user.id as scan_user_id',
                'ejyy_property_company_user.real_name as scan_real_name'
            )
            .where('ejyy_vistor.id', id)
            .andWhere('ejyy_vistor.community_id', community_id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取访客信息'
            });
        }

        if (info.property_company_user_id) {
            registrant = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.property_company_user_id)
                .select('id', 'real_name')
                .first();
        }

        delete info.property_company_user_id;

        const uid = utils.access.encrypt(info.id, info.building_id, VISTOR_ACCESS_CODE);

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                uid,
                registrant
            }
        };
    }
};

export default PcVistorDetailAction;
