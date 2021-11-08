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

import Knex from 'knex';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import { EjyyCommunitySetting, EjyyBuildingInfo, EjyyUserBuilding, EjyyCommunityInfo } from '~/types/model';
import { BINDING_BUILDING } from '~/constant/status';

interface ModalAlias {
    user_building_id: number;
}

type Building = ModalAlias &
    Pick<EjyyUserBuilding, 'building_id' | 'authenticated' | 'authenticated_type'> &
    Pick<EjyyBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number'>;

type Community = Pick<EjyyCommunityInfo, 'name' | 'banner' | 'phone' | 'province' | 'city' | 'district'> &
    Pick<EjyyCommunitySetting, 'access_nfc' | 'access_qrcode' | 'access_remote' | 'fitment_pledge'> &
    Pick<EjyyBuildingInfo, 'community_id'> & {
        houses: Building[];
        carports: Building[];
        warehouses: Building[];
        merchants: Building[];
        garages: Building[];
    };

type Record = ModalAlias &
    Pick<EjyyCommunityInfo, 'name' | 'banner' | 'phone' | 'province' | 'city' | 'district'> &
    Pick<EjyyUserBuilding, 'building_id' | 'authenticated' | 'authenticated_type'> &
    Pick<EjyyBuildingInfo, 'community_id' | 'type' | 'area' | 'building' | 'unit' | 'number'> &
    Pick<EjyyCommunitySetting, 'access_nfc' | 'access_qrcode' | 'access_remote' | 'fitment_pledge'>;

interface ComunityMap {
    [key: number]: Community;
}

interface CommunitiesInfo {
    list: Community[];
    current: Community;
}

// 涉及两个问题，关联的家庭用户操作
async function communityService(model: Knex, wehcatMpUserId: number): Promise<CommunitiesInfo> {
    const result: Record[] = await model
        .table('ejyy_user_building')
        .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
        .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_building_info.community_id')
        .leftJoin('ejyy_community_setting', 'ejyy_community_setting.community_id', 'ejyy_building_info.community_id')
        .where('ejyy_user_building.wechat_mp_user_id', wehcatMpUserId)
        .andWhere('ejyy_user_building.status', BINDING_BUILDING)
        .select(
            'ejyy_user_building.id as user_building_id',
            'ejyy_user_building.authenticated',
            'ejyy_user_building.authenticated_type',
            'ejyy_building_info.id as building_id',
            'ejyy_building_info.community_id',
            'ejyy_building_info.type',
            'ejyy_building_info.area',
            'ejyy_building_info.building',
            'ejyy_building_info.unit',
            'ejyy_building_info.number',
            'ejyy_community_info.name',
            'ejyy_community_info.banner',
            'ejyy_community_info.phone',
            'ejyy_community_info.province',
            'ejyy_community_info.city',
            'ejyy_community_info.district',
            'ejyy_community_setting.access_nfc',
            'ejyy_community_setting.access_qrcode',
            'ejyy_community_setting.access_remote',
            'ejyy_community_setting.fitment_pledge'
        )
        .orderBy('ejyy_community_info.id', 'desc');

    const map: ComunityMap = {};

    result.forEach(record => {
        if (!(record.community_id in map)) {
            map[record.community_id] = {
                community_id: record.community_id,
                name: record.name,
                banner: record.banner,
                phone: record.phone,
                province: record.province,
                city: record.city,
                district: record.district,
                houses: [],
                carports: [],
                warehouses: [],
                merchants: [],
                garages: [],
                access_nfc: record.access_nfc,
                access_qrcode: record.access_qrcode,
                access_remote: record.access_remote,
                fitment_pledge: record.fitment_pledge
            };
        }

        const building: Building = {
            building_id: record.building_id,
            type: record.type,
            area: record.area,
            building: record.building,
            unit: record.unit,
            number: record.number,
            user_building_id: record.user_building_id,
            authenticated: record.authenticated,
            authenticated_type: record.authenticated_type
        };

        switch (building.type) {
            case HOUSE:
                map[record.community_id].houses.push(building);
                break;

            case CARPORT:
                map[record.community_id].carports.push(building);
                break;

            case WAREHOUSE:
                map[record.community_id].warehouses.push(building);
                break;

            case MERCHANT:
                map[record.community_id].merchants.push(building);
                break;

            case GARAGE:
                map[record.community_id].garages.push(building);
                break;
        }
    });

    const list = [];

    for (let id in map) {
        list.push(map[id]);
    }

    list.reverse();

    const mainCommunityInfo = await model
        .table('ejyy_user_default_community')
        .where({ wechat_mp_user_id: wehcatMpUserId })
        .select('community_id')
        .first();

    let default_community_id = null;

    // 一定要注意删除社区时候判断默认社区 否则此处逻辑不满足
    if (
        mainCommunityInfo &&
        mainCommunityInfo.community_id &&
        list.some(item => item.community_id === mainCommunityInfo.community_id)
    ) {
        default_community_id = mainCommunityInfo.community_id;
    } else {
        if (list.length > 0) {
            default_community_id = list[0].community_id;

            if (!mainCommunityInfo) {
                await model.table('ejyy_user_default_community').insert({
                    wechat_mp_user_id: wehcatMpUserId,
                    community_id: default_community_id
                });
            } else {
                await model
                    .table('ejyy_user_default_community')
                    .update({ community_id: default_community_id })
                    .where({ wechat_mp_user_id: wehcatMpUserId });
            }
        }
    }

    let current = null;

    if (default_community_id) {
        current = list[list.findIndex(({ community_id }) => community_id === default_community_id)];
    }

    return {
        list,
        current
    };
}

export default communityService;
