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
import {
    SUCCESS,
    QUERY_ILLEFAL,
    STATUS_ERROR,
    DATA_MODEL_UPDATE_FAIL,
    EXCEED_ALLOW_BINDING_CAR_NUMBER
} from '~/constant/code';
import { BINDING_CAR, UNBINDING_CAR, FALSE } from '~/constant/status';
import { OPEARTE_BY_COMPANY } from '~/constant/operate_type';
import { CARPORT, GARAGE } from '~/constant/building';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    building_id: number;
    community_id: number;
}

const PcCarBindingAction = <Action>{
    router: {
        path: '/car/binding',
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
                name: 'building_id',
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
        const { building_id, id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_user_car')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_car.building_id')
            .leftJoin(
                'ejyy_community_setting',
                'ejyy_community_setting.community_id',
                'ejyy_building_info.community_id'
            )
            .where('ejyy_user_car.id', id)
            .andWhere('ejyy_user_car.building_id', building_id)
            .andWhere('ejyy_building_info.community_id', community_id)
            .select(
                'ejyy_user_car.status',
                'ejyy_community_setting.carport_max_car',
                'ejyy_community_setting.garage_max_car',
                'ejyy_building_info.type'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改车辆绑定状态'
            });
        }

        if (detail.status !== UNBINDING_CAR) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '车辆状态错误'
            });
        }

        const [{ count }] = await ctx.model
            .from('ejyy_user_car')
            .where('building_id', building_id)
            .andWhere('status', BINDING_CAR)
            .count({ count: 'id' });

        if (detail.type === CARPORT && count >= detail.carport_max_car) {
            return (ctx.body = {
                code: EXCEED_ALLOW_BINDING_CAR_NUMBER,
                message: `每个车位最多绑定${detail.carport_max_car}辆车`
            });
        }

        if (detail.type === GARAGE && count > detail.garage_max_car) {
            return (ctx.body = {
                code: EXCEED_ALLOW_BINDING_CAR_NUMBER,
                message: `每个车库最多绑定${detail.garage_max_car}辆车`
            });
        }

        const affect = await ctx.model
            .from('ejyy_user_car')
            .update({
                status: BINDING_CAR
            })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '修改车辆绑定状态失败'
            });
        }

        const created_at = Date.now();

        await ctx.model.from('ejyy_user_car_sync').insert({
            user_car_id: id,
            is_remove: FALSE
        });

        await ctx.model.from('ejyy_user_car_operate_log').insert({
            user_car_id: id,
            property_company_user_id: ctx.pcUserInfo.id,
            status: BINDING_CAR,
            operate_by: OPEARTE_BY_COMPANY,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            message: '修改车辆绑定状态成功',
            data: {
                created_at
            }
        };
    }
};

export default PcCarBindingAction;
