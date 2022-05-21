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
import { EjyyBuildingInfo, EjyyUserBuilding } from '~/types/model';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { NORMAL_STATUS, TRUE, BINDING_BUILDING } from '~/constant/status';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';

interface RequestBody {
    phone: string;
    community_id: number;
}

interface ModalAlias {
    user_building_id: number;
}

type Building = ModalAlias &
    Pick<EjyyUserBuilding, 'building_id' | 'authenticated' | 'authenticated_type'> &
    Pick<EjyyBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number'>;

const PcOptionOwerAction = <Action>{
    router: {
        path: '/option/ower',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'phone',
                required: true,
                regex: /^1\d{10}$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { phone, community_id } = <RequestBody>ctx.request.body;

        const owerInfo = await ctx.model
            .from('ejyy_wechat_mp_user')
            .where('phone', phone)
            .andWhere('intact', TRUE)
            .select('id', 'real_name', 'phone', 'avatar_url')
            .first();

        if (!owerInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '未查询到业主信息'
            });
        }

        const result = <Building[]>await ctx.model
            .table('ejyy_user_building')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
            .where('ejyy_user_building.wechat_mp_user_id', owerInfo.id)
            .andWhere('ejyy_user_building.status', BINDING_BUILDING)
            .andWhere('ejyy_building_info.community_id', community_id)
            .select(
                'ejyy_user_building.id as user_building_id',
                'ejyy_user_building.authenticated',
                'ejyy_user_building.authenticated_type',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_building_info.id as building_id'
            )
            .orderBy('ejyy_user_building.id', 'desc');

        if (result.length === 0) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '未查询到业主信息'
            });
        }

        const buildings = {
            houses: [],
            carports: [],
            warehouses: [],
            merchants: [],
            garages: []
        };

        result.forEach(record => {
            switch (record.type) {
                case HOUSE:
                    buildings.houses.push(record);
                    break;

                case CARPORT:
                    buildings.carports.push(record);
                    break;

                case WAREHOUSE:
                    buildings.warehouses.push(record);
                    break;

                case MERCHANT:
                    buildings.merchants.push(record);
                    break;

                case GARAGE:
                    buildings.garages.push(record);
                    break;
            }
        });

        owerInfo.phone = utils.phone.hide(owerInfo.phone);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...owerInfo,
                ...buildings
            }
        };
    }
};

export default PcOptionOwerAction;
