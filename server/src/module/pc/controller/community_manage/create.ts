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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    name: string;
    banner: string;
    province: string;
    city: string;
    district: string;
    phone: string;
    access_nfc: typeof TRUE | typeof FALSE;
    access_remote: typeof TRUE | typeof FALSE;
    access_qrcode: typeof TRUE | typeof FALSE;
    carport_max_car: number;
    fitment_pledge: typeof TRUE | typeof FALSE;
}

const CwCommunityManageCreateAction = <Action>{
    router: {
        path: '/community_manage/create',
        method: 'post',
        authRequired: true
    },
    validator: {
        body: [
            {
                name: 'name',
                required: true,
                max: 12
            },
            {
                name: 'banner',
                required: true,
                max: 128,
                regex: /^\/community_banner\/[a-z0-9]{32}\.(jpg|jpeg|png)$/
            },
            {
                name: 'province',
                required: true,
                max: 12
            },
            {
                name: 'city',
                required: true,
                max: 12
            },
            {
                name: 'district',
                required: true,
                max: 12
            },
            {
                name: 'phone',
                required: true,
                length: 11
            },
            {
                name: 'access_nfc',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'access_remote',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'access_qrcode',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'carport_max_car',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'fitment_pledge',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            }
        ]
    },
    response: async ctx => {
        const {
            name,
            banner,
            province,
            city,
            district,
            phone,
            access_nfc,
            access_remote,
            access_qrcode,
            carport_max_car,
            fitment_pledge
        } = <RequestBody>ctx.request.body;

        const [id] = await ctx.model.from('ejyy_community_info').insert({
            name,
            banner,
            province,
            city,
            district,
            phone,
            created_at: Date.now(),
            created_by: ctx.pcUserInfo.id
        });

        await ctx.model.from('ejyy_community_setting').insert({
            access_nfc,
            access_remote,
            access_qrcode,
            carport_max_car,
            fitment_pledge,
            community_id: id
        });

        await ctx.model.from('ejyy_property_company_user_access_community').insert({
            community_id: id,
            property_company_user_id: ctx.pcUserInfo.id
        });

        ctx.body = {
            code: SUCCESS,
            message: '新建小区信息成功',
            data: {
                id
            }
        };
    }
};

export default CwCommunityManageCreateAction;
