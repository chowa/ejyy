/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
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

const CwCommunityManageUpdateAction = <Action>{
    router: {
        path: '/community_manage/update',
        method: 'post',
        authRequired: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
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
            community_id,
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

        const affact = await ctx.model
            .from('ejyy_community_info')
            .update({
                name,
                banner,
                province,
                city,
                district,
                phone
            })
            .where('id', community_id);

        if (!affact) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的小区'
            });
        }

        await ctx.model
            .from('ejyy_community_setting')
            .update({
                access_nfc,
                access_remote,
                access_qrcode,
                carport_max_car,
                fitment_pledge
            })
            .where('community_id', community_id);

        ctx.body = {
            code: SUCCESS,
            message: '更新小区信息成功'
        };
    }
};

export default CwCommunityManageUpdateAction;
