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
import * as ROLE from '~/constant/role_access';
import { BINDING_BUILDING, BINDING_CAR, TRUE } from '~/constant/status';
import utils from '~/utils';
import os from 'os';
import checkDiskSpace from 'check-disk-space';
import moment from 'moment';

interface RequestBody {
    community_id: number;
}

const StatisticScreenAction = <Action>{
    router: {
        path: '/statistic/screen',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ANYONE]
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

        const building_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_building_info')
                .where('community_id', community_id)
                .count()
        );

        const ower_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_wechat_mp_user')
                .whereIn('id', function() {
                    this.from('ejyy_user_building')
                        .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
                        .where('ejyy_building_info.community_id', community_id)
                        .andWhere('ejyy_user_building.status', BINDING_BUILDING)
                        .select('ejyy_user_building.wechat_mp_user_id');
                })
                .count()
        );

        const car_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_user_car')
                .where('status', BINDING_CAR)
                .whereIn('building_id', function() {
                    this.from('ejyy_building_info')
                        .where('community_id', community_id)
                        .select('id');
                })
                .count()
        );

        const pet_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_pet')
                .where('community_id', community_id)
                .count()
        );

        const repair_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_repair')
                .where('community_id', community_id)
                .count()
        );

        const complain_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_complain')
                .where('community_id', community_id)
                .count()
        );

        const movecar_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_move_car')
                .where('community_id', community_id)
                .count()
        );

        const diskInfo = await checkDiskSpace('/');

        const day_start = moment()
            .startOf('day')
            .valueOf();
        const day_end = moment()
            .endOf('day')
            .valueOf();

        const entrance_log = await ctx.model
            .from('ejyy_iot_entrance_log')
            .leftJoin('ejyy_iot_entrance', 'ejyy_iot_entrance.id', 'ejyy_iot_entrance_log.entrance_id')
            .where('ejyy_iot_entrance.community_id', community_id)
            .andWhere('ejyy_iot_entrance_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ejyy_iot_entrance_log.created_at', '<=', day_end)
            .select('ejyy_iot_entrance_log.created_at');

        const elevator_log = await ctx.model
            .from('ejyy_iot_elevator_log')
            .leftJoin('ejyy_iot_elevator', 'ejyy_iot_elevator.id', 'ejyy_iot_elevator_log.elevator_id')
            .where('ejyy_iot_elevator.community_id', community_id)
            .andWhere('ejyy_iot_elevator_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ejyy_iot_elevator_log.created_at', '<=', day_end)
            .select('ejyy_iot_elevator_log.created_at');

        const lamp_log = await ctx.model
            .from('ejyy_iot_lamp_log')
            .leftJoin('ejyy_iot_lamp_line', 'ejyy_iot_lamp_line.id', 'ejyy_iot_lamp_log.lamp_line_id')
            .leftJoin('ejyy_iot_lamp', 'ejyy_iot_lamp.id', 'ejyy_iot_lamp_line.lamp_id')
            .where('ejyy_iot_lamp.community_id', community_id)
            .andWhere('ejyy_iot_lamp_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ejyy_iot_lamp_log.created_at', '<=', day_end)
            .select('ejyy_iot_lamp_log.created_at');

        const repeater_log = await ctx.model
            .from('ejyy_iot_meter_read')
            .leftJoin('ejyy_iot_meter', 'ejyy_iot_meter.id', 'ejyy_iot_meter_read.meter_id')
            .where('ejyy_iot_meter.community_id', community_id)
            .andWhere('ejyy_iot_meter_read.from_repeater', TRUE)
            .andWhere('ejyy_iot_meter_read.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ejyy_iot_meter_read.created_at', '<=', day_end)
            .select('ejyy_iot_meter_read.created_at');

        const park_log = await ctx.model
            .from('ejyy_iot_park_log')
            .leftJoin('ejyy_iot_park', 'ejyy_iot_park.id', 'ejyy_iot_park_log.park_id')
            .where('ejyy_iot_park.community_id', community_id)
            .andWhere('ejyy_iot_park_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ejyy_iot_park_log.created_at', '<=', day_end)
            .select('ejyy_iot_park_log.created_at');

        const warning_log = await ctx.model
            .from('ejyy_iot_warning_log')
            .leftJoin('ejyy_iot_warning', 'ejyy_iot_warning.id', 'ejyy_iot_warning_log.warning_id')
            .where('ejyy_iot_warning.community_id', community_id)
            .andWhere('ejyy_iot_warning_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ejyy_iot_warning_log.created_at', '<=', day_end)
            .select('ejyy_iot_warning_log.created_at');

        const center = await ctx.model
            .from('ejyy_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', true)
            .select('lat', 'lng')
            .first();

        const entrance = await ctx.model
            .from('ejyy_iot_entrance')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const elevator = await ctx.model
            .from('ejyy_iot_elevator')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const lamp = await ctx.model
            .from('ejyy_iot_lamp')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const repeater = await ctx.model
            .from('ejyy_iot_meter_repeater')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const park = await ctx.model
            .from('ejyy_iot_park')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const warning = await ctx.model
            .from('ejyy_iot_warning')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const entrance_current_day_log = await ctx.model
            .from('ejyy_iot_entrance_log')
            .leftJoin('ejyy_iot_entrance', 'ejyy_iot_entrance.id', 'ejyy_iot_entrance_log.entrance_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_iot_entrance_log.wechat_mp_user_id')
            .leftJoin('ejyy_vistor', 'ejyy_vistor.id', 'ejyy_iot_entrance_log.vistor_id')
            .where('ejyy_iot_entrance.community_id', community_id)
            .andWhere('ejyy_iot_entrance_log.created_at', '>=', day_start)
            .andWhere('ejyy_iot_entrance_log.created_at', '<=', day_end)
            .select(
                'ejyy_iot_entrance_log.created_at',
                'ejyy_iot_entrance.name',
                'ejyy_wechat_mp_user.real_name as ower',
                'ejyy_vistor.vistor_name as vistor'
            )
            .limit(15)
            .offset(0)
            .orderBy('ejyy_iot_entrance_log.id', 'desc');

        const elevator_current_day_log = await ctx.model
            .from('ejyy_iot_elevator_log')
            .leftJoin('ejyy_iot_elevator', 'ejyy_iot_elevator.id', 'ejyy_iot_elevator_log.elevator_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_iot_elevator_log.wechat_mp_user_id')
            .leftJoin('ejyy_vistor', 'ejyy_vistor.id', 'ejyy_iot_elevator_log.vistor_id')
            .where('ejyy_iot_elevator.community_id', community_id)
            .andWhere('ejyy_iot_elevator_log.created_at', '>=', day_start)
            .andWhere('ejyy_iot_elevator_log.created_at', '<=', day_end)
            .select(
                'ejyy_iot_elevator_log.created_at',
                'ejyy_iot_elevator.name',
                'ejyy_wechat_mp_user.real_name as ower',
                'ejyy_vistor.vistor_name as vistor'
            )
            .limit(15)
            .offset(0)
            .orderBy('ejyy_iot_elevator_log.id', 'desc');

        const park_current_day_log = await ctx.model
            .from('ejyy_iot_park_log')
            .leftJoin('ejyy_iot_park', 'ejyy_iot_park.id', 'ejyy_iot_park_log.park_id')
            .where('ejyy_iot_park.community_id', community_id)
            .andWhere('ejyy_iot_park_log.created_at', '>=', day_start)
            .andWhere('ejyy_iot_park_log.created_at', '<=', day_end)
            .select(
                'ejyy_iot_park_log.created_at',
                'ejyy_iot_park_log.car_number',
                'ejyy_iot_park_log.gate',
                'ejyy_iot_park.name'
            )
            .limit(15)
            .offset(0)
            .orderBy('ejyy_iot_park_log.id', 'desc');

        const repair_current_day = await ctx.model
            .from('ejyy_repair')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start)
            .andWhere('created_at', '<=', day_end)
            .select('step', 'merge_id', 'rate');

        const complain_current_day = await ctx.model
            .from('ejyy_complain')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start)
            .andWhere('created_at', '<=', day_end)
            .select('step', 'merge_id', 'rate');

        const warning_current = await ctx.model
            .from('ejyy_iot_warning_log')
            .leftJoin('ejyy_iot_warning', 'ejyy_iot_warning.id', 'ejyy_iot_warning_log.warning_id')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_iot_warning_log.building_id')
            .where('ejyy_iot_warning.community_id', community_id)
            .andWhere('ejyy_iot_warning_log.created_at', '>=', day_start)
            .andWhere('ejyy_iot_warning_log.created_at', '<=', day_end)
            .select(
                'ejyy_iot_warning_log.created_at',
                'ejyy_iot_warning_log.category',
                'ejyy_iot_warning_log.building_id',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .limit(10)
            .offset(0)
            .orderBy('ejyy_iot_warning_log.id', 'desc');

        const notice = await ctx.model
            .from('ejyy_notice_to_user')
            .where('community_id', community_id)
            .andWhere('published', TRUE)
            .select('title', 'overview')
            .orderBy('id', 'desc')
            .first();

        ctx.body = {
            code: SUCCESS,
            data: {
                building_total,
                ower_total,
                car_total,
                pet_total,
                repair_total,
                complain_total,
                movecar_total,
                cpu: Math.round(os.loadavg()[0]),
                mem: Math.round((1 - os.freemem() / os.totalmem()) * 100),
                disk: Math.round((1 - diskInfo.free / diskInfo.size) * 100),
                log: {
                    entrance: entrance_log,
                    elevator: elevator_log,
                    lamp: lamp_log,
                    repeater: repeater_log,
                    park: park_log,
                    warning: warning_log
                },
                iot: {
                    center,
                    entrance,
                    elevator,
                    lamp,
                    repeater,
                    park,
                    warning
                },
                current: {
                    entrance_current_day_log,
                    elevator_current_day_log,
                    park_current_day_log
                },
                order: {
                    repair_current_day,
                    complain_current_day
                },
                warning_current,
                notice
            }
        };
    }
};

export default StatisticScreenAction;
