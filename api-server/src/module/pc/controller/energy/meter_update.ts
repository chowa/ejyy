/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, METER_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { IOT_METER_WATER, IOT_METER_ELECTRICITY, IOT_METER_GAS } from '~/constant/iot';
import { EjyyBuildingInfo } from '~/types/model';

interface RequestBody {
    id: number;
    community_id: number;
    building_id?: number;
    name: string;
    password?: string;
    category: typeof IOT_METER_WATER | typeof IOT_METER_ELECTRICITY | typeof IOT_METER_GAS;
    model: string;
    no?: string;
    imei?: string;
    repeater_id?: number;
    init_value: number;
    current_value: number;
    max_value: number;
}

const PcEnergyMeterUpdateAction = <Action>{
    router: {
        path: '/energy/meter_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.NHGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'building_id',
                regex: /^\d+$/
            },
            {
                name: 'name',
                max: 32,
                required: true
            },
            {
                name: 'password',
                max: 32
            },
            {
                name: 'category',
                regex: /^1|2|3$/,
                required: true
            },
            {
                name: 'model',
                max: 32,
                required: true
            },
            {
                name: 'no',
                max: 32
            },
            {
                name: 'imei',
                max: 32
            },
            {
                name: 'repeater_id',
                regex: /^\d+$/
            },
            {
                name: 'init_value',
                regex: /^\d+(\.\d+)?$/,
                required: true
            },
            {
                name: 'current_value',
                regex: /^\d+(\.\d+)?$/,
                required: true
            },
            {
                name: 'max_value',
                regex: /^\d+(\.\d+)?$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const {
            id,
            community_id,
            building_id,
            name,
            password,
            category,
            model,
            no,
            imei,
            repeater_id,
            init_value,
            current_value,
            max_value
        } = <RequestBody>ctx.request.body;

        const record = await ctx.model
            .from('ejyy_iot_meter')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改疫苗'
            });
        }

        let buildingInfo: Pick<EjyyBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number'>;

        if (building_id) {
            buildingInfo = await ctx.model
                .from('ejyy_building_info')
                .where('community_id', community_id)
                .andWhere('id', building_id)
                .select('type', 'area', 'building', 'unit', 'number')
                .first();

            if (!buildingInfo) {
                return (ctx.body = {
                    code: QUERY_ILLEFAL,
                    message: '非法的房产信息'
                });
            }
        }

        if (repeater_id) {
            const verifyRepeater = await ctx.model
                .from('ejyy_iot_meter_repeater')
                .where('community_id', community_id)
                .andWhere('id', repeater_id)
                .first();

            if (!verifyRepeater) {
                return (ctx.body = {
                    code: QUERY_ILLEFAL,
                    message: '非法的中继器信息'
                });
            }
        }

        const exist = await ctx.model
            .from('ejyy_iot_meter')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: METER_NAME_EXIST,
                message: '仪表名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_iot_meter')
            .update({
                building_id: building_id ? building_id : null,
                category,
                name,
                password: password ? password : null,
                model,
                no: no ? no : null,
                imei: imei ? imei : null,
                repeater_id: repeater_id ? repeater_id : null,
                init_value,
                max_value,
                current_value
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '修改仪表配置成功',
            data: {
                ...buildingInfo
            }
        };
    }
};

export default PcEnergyMeterUpdateAction;
