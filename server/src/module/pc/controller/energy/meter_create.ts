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
import { SUCCESS, QUERY_ILLEFAL, METER_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { IOT_METER_WATER, IOT_METER_ELECTRICITY, IOT_METER_GAS } from '~/constant/iot';
import { EjyyBuildingInfo } from '~/types/model';

interface RequestBody {
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

const PcEnergyMeterCreateAction = <Action>{
    router: {
        path: '/energy/meter_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.NHGL],
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
            .first();

        if (exist) {
            return (ctx.body = {
                code: METER_NAME_EXIST,
                message: '仪表名称已存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_iot_meter').insert({
            community_id,
            building_id: building_id ? building_id : null,
            name,
            password: password ? password : null,
            category,
            model,
            no: no ? no : null,
            imei: imei ? imei : null,
            repeater_id: repeater_id ? repeater_id : null,
            init_value,
            current_value,
            max_value,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at,
                ...buildingInfo
            }
        };
    }
};

export default PcEnergyMeterCreateAction;
