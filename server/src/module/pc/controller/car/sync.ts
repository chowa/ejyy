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
import { TRUE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
    building_id: number;
}

const PcCarSyncAction = <Action>{
    router: {
        path: '/car/sync',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CLGL]
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
            },
            {
                name: 'building_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, building_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_user_car')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_car.building_id')
            .where('ejyy_user_car.id', id)
            .andWhere('ejyy_building_info.community_id', community_id)
            .andWhere('ejyy_user_car.building_id', building_id)
            .select()
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改车辆同步状态'
            });
        }

        if (detail.sync === TRUE) {
            return (ctx.body = {
                code: SUCCESS,
                message: '车辆同步状态已更新'
            });
        }

        await ctx.model
            .from('ejyy_user_car')
            .where('id', id)
            .update('sync', TRUE);

        await ctx.model
            .from('ejyy_user_car_sync')
            .where('user_car_id', id)
            .delete();

        ctx.body = {
            code: SUCCESS,
            message: '修改车辆同步状态成功'
        };
    }
};

export default PcCarSyncAction;
