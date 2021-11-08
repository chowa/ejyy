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

interface RequestBody {
    building_ids: number[];
    community_id: number;
}

const MpAccessListAction = <Action>{
    router: {
        path: '/access/list',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'building_ids',
                required: true,
                validator: val => {
                    return Array.isArray(val) && val.every(item => /^\d+$/.test(item));
                }
            },
            {
                name: 'community_id',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { building_ids, community_id } = <RequestBody>ctx.request.body;

        const cardList = await ctx.model
            .from('ejyy_building_access')
            .whereIn('building_id', building_ids)
            .select('building_id', 'uid')
            .orderBy('id', 'desc');

        const entranceList = await ctx.model
            .from('ejyy_iot_entrance')
            .where('community_id', community_id)
            .select('id', 'name')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                cardList,
                entranceList
            }
        };
    }
};

export default MpAccessListAction;
