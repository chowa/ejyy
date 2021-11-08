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
import { BINDING_BUILDING, BINDING_CAR } from '~/constant/status';
import { CARPORT, GARAGE } from '~/constant/building';
import { EjyyUserCar, EjyyBuildingInfo } from '~/types/model';

type CarInfo = Pick<EjyyUserCar, 'car_number' | 'car_type' | 'is_new_energy' | 'building_id' | 'status' | 'sync'> & {
    car_id: number;
};

type BuildingInfo = Pick<EjyyBuildingInfo, 'area' | 'unit' | 'building' | 'unit' | 'number' | 'type'> & {
    cars: CarInfo[];
    building_id: number;
};

interface BuildingMap {
    [key: number]: BuildingInfo;
}

type CarsInfo = CarInfo & BuildingInfo & { car_id: number; cars: CarInfo[] };

interface RequestBody {
    community_id: number;
}

const MpCarListAction = <Action>{
    router: {
        path: '/car/list',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const carsInfo: CarsInfo[] = await ctx.model
            .from('ejyy_user_building')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
            .leftJoin('ejyy_user_car', 'ejyy_user_car.building_id', 'ejyy_user_building.building_id')
            .where('ejyy_user_building.wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ejyy_user_building.status', BINDING_BUILDING)
            .andWhere('ejyy_building_info.community_id', community_id)
            .andWhere(function() {
                this.where('ejyy_building_info.type', CARPORT).orWhere('ejyy_building_info.type', GARAGE);
            })
            .select(
                'ejyy_user_building.building_id',
                'ejyy_building_info.type',
                'ejyy_building_info.building',
                'ejyy_building_info.area',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_user_car.car_number',
                'ejyy_user_car.car_type',
                'ejyy_user_car.is_new_energy',
                'ejyy_user_car.id as car_id',
                'ejyy_user_car.status',
                'ejyy_user_car.sync'
            )
            .orderBy('ejyy_user_car.id', 'desc');

        const map: BuildingMap = {};

        carsInfo.forEach(record => {
            if (!(record.building_id in map)) {
                map[record.building_id] = {
                    building_id: record.building_id,
                    building: record.building,
                    type: record.type,
                    area: record.area,
                    unit: record.unit,
                    number: record.number,
                    cars: []
                };
            }

            if (record.status === BINDING_CAR) {
                map[record.building_id].cars.push({
                    car_number: record.car_number,
                    car_type: record.car_type,
                    car_id: record.car_id,
                    status: record.status,
                    sync: record.sync,
                    is_new_energy: record.is_new_energy,
                    building_id: record.building_id
                });
            }
        });

        const list: BuildingInfo[] = Object.values(map);

        list.reverse();

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpCarListAction;
