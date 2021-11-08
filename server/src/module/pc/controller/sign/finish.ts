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

const PcSignFinishAction = <Action>{
    router: {
        path: '/sign/finish',
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

        // 检查是否有有上班打卡 但是下班没打卡
        const begined = await ctx.model
            .from('ejyy_employee_sign_record')
            .whereNull('finish')
            .andWhere('community_id', community_id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .andWhere('date', date)
            .whereNotNull('begin')
            .first();

        if (!begined) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '今日不存在上班打卡记录，无法下班打卡'
            });
        }

        if (mapService.distance(setting.lat, setting.lng, lat, lng) - accuracy > setting.distance) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '超出打卡半径距离，无法打卡'
            });
        }

        const finish = Date.now();

        await ctx.model
            .from('ejyy_employee_sign_record')
            .update({
                finish,
                finish_lat: lat,
                finish_lng: lng,
                finish_accuracy: accuracy
            })
            .where('id', begined.id);

        ctx.body = {
            code: SUCCESS,
            message: '下班打卡成功',
            data: {
                finish
            }
        };
    }
};

export default PcSignFinishAction;
