/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WORK_CHECK_NOT_EXIST, STATUS_ERROR } from '~/constant/code';
import { TRUE } from '~/constant/status';
import * as mapService from '~/service/map';
import moment from 'moment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    lng: number;
    lat: number;
    accuracy: number;
}

const PcSignBeginAction = <Action>{
    router: {
        path: '/sign/begin',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'lng',
                required: true,
                regex: /^\d+(\.\d+)?$/
            },
            {
                name: 'lat',
                required: true,
                regex: /^\d+(\.\d+)?$/
            },
            {
                name: 'accuracy',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, lng, lat, accuracy } = <RequestBody>ctx.request.body;

        const setting = await ctx.model
            .from('ejyy_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', TRUE)
            .first();

        if (!setting) {
            return (ctx.body = {
                code: WORK_CHECK_NOT_EXIST,
                message: '未设置考勤信息，请联系管理员设置'
            });
        }

        if (accuracy > 100) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '精确度过低，无法打卡'
            });
        }

        const date = moment()
            .startOf('day')
            .valueOf();

        // 检查是否有没下班打卡的
        const unfinished = await ctx.model
            .from('ejyy_employee_sign_record')
            .whereNull('finish')
            .andWhere('community_id', community_id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .andWhere('date', date)
            .first();

        if (unfinished) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '今天存在下班未打卡的情况，无法正常上班打卡'
            });
        }

        if (mapService.distance(setting.lat, setting.lng, lat, lng) - accuracy > setting.distance) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '超出打卡半径距离，无法打卡'
            });
        }

        const begin = Date.now();

        await ctx.model.from('ejyy_employee_sign_record').insert({
            community_id,
            date,
            begin,
            begin_lat: lat,
            begin_lng: lng,
            begin_accuracy: accuracy,
            created_by: ctx.pcUserInfo.id
        });

        ctx.body = {
            code: SUCCESS,
            message: '上班打卡成功',
            data: {
                begin
            }
        };
    }
};

export default PcSignBeginAction;
