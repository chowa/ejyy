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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { GREEN_TOUR_CODE, YELLOW_TOUR_CODE, RED_TOUR_CODE } from '~/constant/epidemic';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    wechat_mp_user_id: number;
    building_id: number;
    community_id: number;
    temperature: number;
    tour_code: typeof GREEN_TOUR_CODE | typeof YELLOW_TOUR_CODE | typeof RED_TOUR_CODE;
    return_hometown: typeof TRUE | typeof FALSE;
    return_from_province?: string;
    return_from_city?: string;
    return_from_district: string;
}

const PcEpidemicCreateAction = <Action>{
    router: {
        path: '/epidemic/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YQFK],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'wechat_mp_user_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'building_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'temperature',
                regex: /^\d+(\.\d+)?$/,
                required: true
            },
            {
                name: 'tour_code',
                regex: /^1|2|3$/,
                required: true
            },
            {
                name: 'return_hometown',
                regex: /^1|0$/,
                required: true
            },
            {
                name: 'return_from_province',
                max: 12
            },
            {
                name: 'return_from_city',
                max: 12
            },
            {
                name: 'return_from_district',
                max: 12
            }
        ]
    },
    response: async ctx => {
        const {
            wechat_mp_user_id,
            building_id,
            community_id,
            tour_code,
            temperature,
            return_hometown,
            return_from_province,
            return_from_city,
            return_from_district
        } = <RequestBody>ctx.request.body;

        const verify = await ctx.model
            .from('ejyy_user_building')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
            .where('ejyy_user_building.wechat_mp_user_id', wechat_mp_user_id)
            .andWhere('ejyy_user_building.building_id', building_id)
            .andWhere('ejyy_building_info.community_id', community_id)
            .first();

        if (!verify) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法数据，不能作为疫情防控数据'
            });
        }

        const [id] = await ctx.model.from('ejyy_epidemic').insert({
            wechat_mp_user_id,
            building_id,
            community_id,
            tour_code,
            temperature,
            return_hometown,
            return_from_province: return_from_province ? return_from_province : null,
            return_from_city: return_from_city ? return_from_city : null,
            return_from_district: return_from_district ? return_from_district : null,
            created_by: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcEpidemicCreateAction;
