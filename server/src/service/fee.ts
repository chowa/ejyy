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

import Knex from 'knex';
import {
    OA_NOTICE_OWER_PROPERTY_FEE,
    OA_NOTICE_URGE_OWER_PROPERTY_FEE,
    SMS_NOTICE_OWER_PROPERTY_FEE,
    SMS_NOTICE_URGE_OWER_PROPERTY_FEE
} from '~/constant/tpl';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import { BINDING_BUILDING, TRUE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import * as smsService from '~/service/sms';
import { EjyyWechatMpUser, EjyyBuildingInfo, EjyyWechatOfficialAccountsUser, EjyyPropertyFee } from '~/types/model';
import utils from '~/utils';
import config from '~/config';

type UserInfo = Pick<EjyyWechatMpUser, 'id' | 'phone' | 'real_name'> &
    Pick<EjyyWechatOfficialAccountsUser, 'open_id' | 'subscribed'>;

type Record = UserInfo & Pick<EjyyBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number' | 'construction_area'>;

interface UserFee extends UserInfo {
    buildings: string[];
    fee: number;
}

interface UserMap {
    [key: number]: UserFee;
}

function double(num: number): string | number {
    if (num < 10) {
        return `0${num}`;
    }

    return num;
}

export function yuan(num: number): string {
    return `${Math.floor(num / 100)}.${double(num % 100)}`;
}

export function computed(building: Pick<EjyyBuildingInfo, 'construction_area' | 'type'>, fee: EjyyPropertyFee): number {
    let fen = 0;
    const { type, construction_area } = building;

    if (type === HOUSE) {
        if (fee.computed_house_fee_by_area === TRUE) {
            fen += Math.floor(fee.house_fee * construction_area);
        } else {
            fen += Math.floor(fee.house_fee);
        }
    } else if (type === CARPORT) {
        if (fee.computed_carport_fee_by_area === TRUE) {
            fen += Math.floor(fee.carport_fee * construction_area);
        } else {
            fen += Math.floor(fee.carport_fee);
        }
    } else if (type === WAREHOUSE) {
        if (fee.computed_warehouse_fee_by_area === TRUE) {
            fen += Math.floor(fee.warehoure_fee * construction_area);
        } else {
            fen += Math.floor(fee.warehoure_fee);
        }
    } else if (type === MERCHANT) {
        if (fee.computed_merchant_fee_by_area === TRUE) {
            fen += Math.floor(fee.merchant_fee * construction_area);
        } else {
            fen += Math.floor(fee.merchant_fee);
        }
    } else if (type === GARAGE) {
        if (fee.computed_garage_fee_by_area === TRUE) {
            fen += Math.floor(fee.garage_fee * construction_area);
        } else {
            fen += Math.floor(fee.garage_fee);
        }
    }

    return fen;
}

interface FeeComputed {
    list: UserFee[];
    fee: EjyyPropertyFee & { community_name: string };
}

async function usersComputed(
    model: Knex,
    community_id: number,
    property_fee_id: number,
    building_id: number = null
): Promise<FeeComputed> {
    const feeDetail = await model
        .from('ejyy_property_fee')
        .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_property_fee.community_id')
        .where('ejyy_property_fee.id', property_fee_id)
        .andWhere('ejyy_property_fee.community_id', community_id)
        .select(
            'ejyy_community_info.name as community_name',
            'ejyy_property_fee.start_year',
            'ejyy_property_fee.end_year',
            'ejyy_property_fee.community_id',
            'ejyy_property_fee.house_fee',
            'ejyy_property_fee.computed_house_fee_by_area',
            'ejyy_property_fee.carport_fee',
            'ejyy_property_fee.computed_carport_fee_by_area',
            'ejyy_property_fee.warehoure_fee',
            'ejyy_property_fee.computed_warehouse_fee_by_area',
            'ejyy_property_fee.merchant_fee',
            'ejyy_property_fee.computed_merchant_fee_by_area',
            'ejyy_property_fee.garage_fee',
            'ejyy_property_fee.computed_garage_fee_by_area'
        )
        .first();

    const records = <Record[]>await model
        .from('ejyy_wechat_mp_user')
        .leftJoin(
            'ejyy_wechat_official_accounts_user',
            'ejyy_wechat_official_accounts_user.union_id',
            'ejyy_wechat_mp_user.union_id'
        )
        .leftJoin('ejyy_user_building', 'ejyy_user_building.wechat_mp_user_id', 'ejyy_wechat_mp_user.id')
        .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
        .where('ejyy_building_info.community_id', feeDetail.community_id)
        .andWhere('ejyy_user_building.status', BINDING_BUILDING)
        .andWhere(function() {
            if (building_id) {
                this.where('ejyy_user_building.building_id', building_id);
            }
        })
        .select(
            'ejyy_wechat_mp_user.id',
            'ejyy_wechat_mp_user.phone',
            'ejyy_wechat_mp_user.real_name',
            'ejyy_wechat_official_accounts_user.open_id',
            'ejyy_wechat_official_accounts_user.subscribed',
            'ejyy_building_info.type',
            'ejyy_building_info.area',
            'ejyy_building_info.building',
            'ejyy_building_info.unit',
            'ejyy_building_info.number',
            'ejyy_building_info.construction_area'
        );

    const map = <UserMap>{};

    records.forEach(item => {
        if (!(item.id in map)) {
            map[item.id] = {
                id: item.id,
                open_id: item.open_id,
                phone: item.phone,
                real_name: item.real_name,
                buildings: [],
                fee: 0,
                subscribed: item.subscribed
            };
        }

        const fee = computed(item, feeDetail);

        map[item.id].fee += fee;
        map[item.id].buildings.push(utils.building.name(item));
    });

    return {
        list: Object.values(map),
        fee: feeDetail
    };
}

export interface SendResult {
    error: number;
    total: number;
}

export async function oaBroadcast(model: Knex, community_id: number, property_fee_id: number): Promise<SendResult> {
    const { list, fee } = await usersComputed(model, community_id, property_fee_id);
    let error = 0;

    for (const user of list) {
        if (user.fee === 0 || !user.subscribed) {
            error++;
            continue;
        }

        const res = await wechatService.sendOaTemplateMessage({
            touser: user.open_id,
            template_id: OA_NOTICE_OWER_PROPERTY_FEE,
            miniprogram: {
                appid: config.wechat.ump.appid,
                pagepath: '/pages/payment/order'
            },
            data: {
                first: {
                    value: `尊敬的业主，${fee.community_name}小区${fee.start_year}年至${fee.end_year}年物业费已开始缴纳，请及时缴费`
                },
                keyword1: {
                    value: user.real_name
                },
                keyword2: {
                    value: utils.text.omit(user.buildings.join('，'), 20)
                },
                keyword3: {
                    value: yuan(user.fee)
                },
                remark: {
                    value: '如有疑问，请与物管人员联系'
                }
            }
        });

        if (res.errcode !== 0) {
            error++;
        }
    }

    return {
        error,
        total: list.length
    };
}

export async function smsBroadcast(model: Knex, community_id: number, property_fee_id: number): Promise<SendResult> {
    const { list, fee } = await usersComputed(model, community_id, property_fee_id);
    let error = 0;

    for (const user of list) {
        if (user.fee === 0 || !user.phone) {
            error++;
            continue;
        }

        const res = await smsService.send({
            phone: user.phone,
            template_id: SMS_NOTICE_OWER_PROPERTY_FEE,
            data: {
                community_name: fee.community_name,
                start_year: fee.start_year,
                end_year: fee.end_year,
                building: utils.text.omit(user.buildings.join('，'), 35),
                fee: yuan(user.fee)
            }
        });

        if (!res.success) {
            error++;
        }
    }

    return {
        error,
        total: list.length
    };
}

export async function oaUrge(
    model: Knex,
    community_id: number,
    property_fee_id: number,
    building_id: number
): Promise<SendResult> {
    const { list, fee } = await usersComputed(model, community_id, property_fee_id, building_id);
    let error = 0;

    for (const user of list) {
        if (user.fee === 0 || !user.subscribed) {
            error++;
            continue;
        }

        const res = await wechatService.sendOaTemplateMessage({
            touser: user.open_id,
            template_id: OA_NOTICE_URGE_OWER_PROPERTY_FEE,
            miniprogram: {
                appid: config.wechat.ump.appid,
                pagepath: '/pages/payment/order'
            },
            data: {
                first: {
                    value: `尊敬的业主，请及时缴纳${fee.community_name}小区${fee.start_year}年至${fee.end_year}年物业费`
                },
                keyword1: {
                    value: utils.text.omit(user.buildings.join('，'), 20)
                },
                keyword2: {
                    value: `截止${fee.end_year}-12-31`
                },
                keyword3: {
                    value: yuan(user.fee)
                },
                remark: {
                    value: '如有疑问，请与物管人员联系'
                }
            }
        });

        if (res.errcode !== 0) {
            error++;
        }
    }

    return {
        error,
        total: list.length
    };
}

export async function smsUrge(
    model: Knex,
    community_id: number,
    property_fee_id: number,
    building_id: number
): Promise<SendResult> {
    const { list, fee } = await usersComputed(model, community_id, property_fee_id, building_id);
    let error = 0;

    for (const user of list) {
        if (user.fee === 0 || !user.phone) {
            error++;
            continue;
        }

        const res = await smsService.send({
            phone: user.phone,
            template_id: SMS_NOTICE_URGE_OWER_PROPERTY_FEE,
            data: {
                community_name: fee.community_name,
                start_year: fee.start_year,
                end_year: fee.end_year,
                building: utils.text.omit(user.buildings.join('，'), 35),
                fee: yuan(user.fee)
            }
        });

        if (!res.success) {
            error++;
        }
    }

    return {
        error,
        total: list.length
    };
}
