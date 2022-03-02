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
import { SUCCESS } from '~/constant/code';

interface RequestBody {
    community_id: number;
    title: string;
    location: string;
    phone: string;
}

const PcConvenientCreateAction = <Action>{
    router: {
        path: '/convenient/create',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'title',
                required: true,
                max: 30
            },
            {
                name: 'location',
                required: true,
                max: 128
            },
            {
                name: 'phone',
                required: true,
                regex: /^\d{11}$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, title, location, phone } = <RequestBody>ctx.request.body;

        const [id] = await ctx.model.from('ejyy_convenient').insert({
            community_id,
            title,
            location,
            phone,
            created_by: ctx.pcUserInfo.id,
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

export default PcConvenientCreateAction;
