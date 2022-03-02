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
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    page_num: number;
    page_size: number;
    building_id?: number;
}

const PcEnergyReadAction = <Action>{
    router: {
        path: '/energy/read',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
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
                name: 'building_id',
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, building_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_iot_meter')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_iot_meter.created_by')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_iot_meter.building_id')
            .leftJoin('ejyy_iot_meter_repeater', 'ejyy_iot_meter_repeater.id', 'ejyy_iot_meter.repeater_id')
            .where('ejyy_iot_meter.community_id', community_id)
            .andWhere(function() {
                if (building_id) {
                    this.where('ejyy_iot_meter.building_id', building_id);
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_iot_meter.id'))
            .select(
                'ejyy_iot_meter.id',
                'ejyy_iot_meter.community_id',
                'ejyy_iot_meter.category',
                'ejyy_iot_meter.name',
                'ejyy_iot_meter.model',
                'ejyy_iot_meter.building_id',
                'ejyy_iot_meter.no',
                'ejyy_iot_meter.imei',
                'ejyy_iot_meter.init_value',
                'ejyy_iot_meter.current_value',
                'ejyy_iot_meter.max_value',
                'ejyy_iot_meter.online',
                'ejyy_iot_meter.created_by',
                'ejyy_iot_meter.created_at',
                'ejyy_property_company_user.real_name',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_iot_meter_repeater.name as repeater'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_iot_meter.id', 'desc');

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

export default PcEnergyReadAction;
