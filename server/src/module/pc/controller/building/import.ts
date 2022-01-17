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
import utils from '~/utils';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';

interface Building {
    type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE;
    area?: string;
    building?: string;
    unit?: string;
    number: string;
    construction_area: number;
    name?: string;
    idcard?: string;
    phone?: string;
}

interface RequestBody {
    community_id: number;
    buildings: Building[];
}

const PcBuildingImportAction = <Action>{
    router: {
        path: '/building/import',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'buildings',
                required: true,
                validator: val => {
                    if (!Array.isArray(val)) {
                        return false;
                    }

                    return val.every(record => {
                        if (![HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE].includes(record.type)) {
                            return false;
                        }

                        if (record.area && record.area.length > 26) {
                            return false;
                        } else if (record.building && record.building.length > 26) {
                            return false;
                        } else if (record.unit && record.unit.length > 26) {
                            return false;
                        } else if (!record.number) {
                            return false;
                        }

                        const haveDefineOwerValue = [record.name, record.idcard, record.phone].some(val => val);
                        const haveUndefineOwerValue = [record.name, record.idcard, record.phone].some(val => !val);
                        const allDefinedOwerValue = [record.name, record.idcard, record.phone].every(val => val);

                        if (haveDefineOwerValue && haveUndefineOwerValue) {
                            return false;
                        }

                        if (allDefinedOwerValue) {
                            if (record.name.length > 12) {
                                return false;
                            } else if (!utils.idcard.verify(record.idcard)) {
                                return false;
                            } else if (!/^1\d{10}$/.test(record.phone)) {
                                return false;
                            }
                        }

                        return true;
                    });
                }
            }
        ]
    },
    response: async ctx => {
        const { community_id, buildings } = <RequestBody>ctx.request.body;
        const created_at = Date.now();
        const ids = [];

        for (let record of buildings) {
            const { type, area, building, unit, number, construction_area, name, idcard, phone } = record;
            const [insertId] = await ctx.model.from('ejyy_building_info').insert({
                community_id,
                type,
                area,
                building,
                unit,
                number,
                construction_area,
                created_by: ctx.pcUserInfo.id,
                created_at
            });

            if (name && idcard && phone) {
                await ctx.model.from('ejyy_property_company_building_registered').insert({
                    building_id: insertId,
                    name,
                    gender: utils.idcard.gender(idcard),
                    idcard: idcard.toUpperCase(),
                    phone,
                    created_by: ctx.pcUserInfo.id,
                    created_at
                });
            }

            ids.push(insertId);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ids
            }
        };
    }
};

export default PcBuildingImportAction;
