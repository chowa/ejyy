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
import { SUCCESS, STATUS_ERROR } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import { VISTOR_ACCESS_QRCODE } from '~/constant/open_access';
import utils from '~/utils';
import * as vistorService from '~/service/vistor';
import moment from 'moment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    building_id: number;
    vistor_name: string;
    vistor_phone: string;
    car_number?: string;
    expire: number;
    user_id: number;
}

const PcVistorCreateAction = <Action>{
    router: {
        path: '/vistor/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FKTX],
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
                validator: val => Date.now() < val,
                required: true
            },
            {
                name: 'user_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, building_id, vistor_name, vistor_phone, car_number, expire, user_id } = <RequestBody>(
            ctx.request.body
        );

        if (vistor_phone === ctx.pcUserInfo.phone) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '莫非四维空间出现了？'
            });
        }

        const vistorInfo = await ctx.model
            .from('ejyy_wechat_mp_user')
            .where('phone', vistor_phone)
            .first();

        const [id] = await ctx.model.from('ejyy_vistor').insert({
            community_id,
            building_id,
            wechat_mp_user_id: user_id,
            property_company_user_id: ctx.pcUserInfo.id,
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

        const uid = utils.access.encrypt(id, building_id, VISTOR_ACCESS_QRCODE);

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                uid
            }
        };
    }
};

export default PcVistorCreateAction;
