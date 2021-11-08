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
import { SUCCESS, EXCEED_ALLOW_BINDING_CAR_NUMBER, CAR_NUMBER_ALEADY_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import { BINDING_CAR, TRUE, FALSE } from '~/constant/status';
import { BLUE_PLATE_CAR, YELLOW_PLATE_CAR } from '~/constant/car';
import { CARPORT, GARAGE } from '~/constant/building';
import { OPEARTE_BY_COMPANY } from '~/constant/operate_type';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    wechat_mp_user_id: number;
    building_id: number;
    community_id: number;
    is_new_energy: typeof TRUE | typeof FALSE;
    car_number: string;
    car_type: typeof BLUE_PLATE_CAR | typeof YELLOW_PLATE_CAR;
}

const PcCarCreateAction = <Action>{
    router: {
        path: '/car/create',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CLGL]
    },
    validator: {
        body: [
            {
                name: 'wechat_mp_user_id',
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
            },
            {
                name: 'is_new_energy',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'car_number',
                required: true,
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'car_type',
                required: true,
                regex: /^1|2$/
            }
        ]
    },
    response: async ctx => {
        const { building_id, is_new_energy, car_number, car_type, wechat_mp_user_id, community_id } = <RequestBody>(
            ctx.request.body
        );

        const exist = await ctx.model
            .from('ejyy_user_car')
            .where('car_number', car_number)
            .andWhere('wechat_mp_user_id', wechat_mp_user_id)
            .andWhere('building_id', building_id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: CAR_NUMBER_ALEADY_EXIST,
                message: '车辆信息已存在，请手动恢复绑定关系',
                data: {
                    community_id,
                    user_car_id: exist.id
                }
            });
        }

        const detail = await ctx.model
            .from('ejyy_building_info')
            .leftJoin(
                'ejyy_community_setting',
                'ejyy_community_setting.community_id',
                'ejyy_building_info.community_id'
            )
            .where('ejyy_building_info.id', building_id)
            .andWhere('ejyy_building_info.community_id', community_id)
            .select(
                'ejyy_community_setting.carport_max_car',
                'ejyy_community_setting.garage_max_car',
                'ejyy_building_info.type'
            )
            .first();

        if (!detail || (detail.type !== CARPORT && detail.type !== GARAGE)) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法绑定车辆'
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

        const [id] = await ctx.model.from('ejyy_user_car').insert({
            wechat_mp_user_id,
            building_id,
            car_number,
            car_type,
            is_new_energy,
            created_at: Date.now()
        });

        await ctx.model.from('ejyy_user_car_operate_log').insert({
            user_car_id: id,
            property_company_user_id: ctx.pcUserInfo.id,
            status: BINDING_CAR,
            operate_by: OPEARTE_BY_COMPANY,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcCarCreateAction;
