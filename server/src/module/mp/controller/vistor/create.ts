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
import { SUCCESS, STATUS_ERROR } from '~/constant/code';
import { BINDING_BUILDING, TRUE, FALSE } from '~/constant/status';
import utils from '~/utils';
import * as vistorService from '~/service/vistor';
import moment from 'moment';

interface RequestBody {
    community_id: number;
    building_id: number;
    vistor_name: string;
    vistor_phone: string;
    car_number?: string;
    expire: number;
}

const MpVistorCreateAction = <Action>{
    router: {
        path: '/vistor/create',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'vistor_name',
                max: 8,
                required: true
            },
            {
                name: 'vistor_phone',
                regex: /^1\d{10}$/,
                required: true
            },
            {
                name: 'car_number',
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'expire',
                regex: /^\d{13}$/,
                validator: val =>
                    Date.now() <
                    moment(val)
                        .endOf('day')
                        .valueOf(),
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, building_id, vistor_name, vistor_phone, car_number, expire } = <RequestBody>(
            ctx.request.body
        );

        if (vistor_phone === ctx.mpUserInfo.phone) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '莫非四维空间出现了？'
            });
        }

        const vistorInfo = await ctx.model
            .from('ejyy_wechat_mp_user')
            .where('phone', vistor_phone)
            .first();

        if (vistorInfo) {
            const vistorBuildingInfo = await ctx.model
                .from('ejyy_user_building')
                .where('building_id', building_id)
                .where('wechat_mp_user_id', vistorInfo.id)
                .where('status', BINDING_BUILDING)
                .first();

            if (vistorBuildingInfo) {
                return (ctx.body = {
                    code: STATUS_ERROR,
                    message: '访客好像是你的家人呦'
                });
            }
        }

        const [id] = await ctx.model.from('ejyy_vistor').insert({
            community_id,
            building_id,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            vistor_name,
            vistor_phone,
            car_number: car_number ? car_number : null,
            have_vistor_info: vistorInfo ? TRUE : FALSE,
            expire: moment(expire)
                .endOf('day')
                .valueOf(),
            created_at: Date.now()
        });

        if (vistorInfo) {
            vistorService.pushAccessToVistor(ctx.model, vistorInfo, id, expire);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default MpVistorCreateAction;
