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
import { BINDING_CAR, UNBINDING_CAR } from '~/constant/status';
import { BLUE_PLATE_CAR, YELLOW_PLATE_CAR } from '~/constant/car';
import { TRUE, FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    car_number?: string;
    car_type?: typeof BLUE_PLATE_CAR | typeof YELLOW_PLATE_CAR;
    is_new_energy?: typeof TRUE | typeof FALSE;
    status?: typeof BINDING_CAR | typeof UNBINDING_CAR;
    sync?: typeof TRUE | typeof FALSE;
}

const PcCarListAction = <Action>{
    router: {
        path: '/car/list',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CLGL]
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'is_new_energy',
                regex: /^0|1$/
            },
            {
                name: 'car_number',
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'car_type',
                regex: /^1|2$/
            },
            {
                name: 'status',
                regex: /^0|1$/
            },
            {
                name: 'sync',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, is_new_energy, car_number, car_type, status, sync } = <RequestBody>(
            ctx.request.body
        );
        const where = {};

        if (is_new_energy !== undefined) {
            where['ejyy_user_car.is_new_energy'] = is_new_energy;
        }

        if (car_number !== undefined) {
            where['ejyy_user_car.car_number'] = car_number;
        }

        if (car_type !== undefined) {
            where['ejyy_user_car.car_type'] = car_type;
        }

        if (status !== undefined) {
            where['ejyy_user_car.status'] = status;
        }

        if (sync !== undefined) {
            where['ejyy_user_car.sync'] = sync;
        }

        const list = await ctx.model
            .from('ejyy_user_car')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_car.building_id')
            .where('ejyy_building_info.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_user_car.id'))
            .select(
                'ejyy_user_car.id',
                'ejyy_user_car.car_number',
                'ejyy_user_car.car_type',
                'ejyy_user_car.is_new_energy',
                'ejyy_user_car.status',
                'ejyy_user_car.sync',
                'ejyy_user_car.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_user_car.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcCarListAction;
