/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE } from '~/constant/status';
import * as mapSerivce from '~/service/map';

interface RequestBody {
    community_id: number;
}

const PcSignSettingDetailAction = <Action>{
    router: {
        path: '/sign_setting/detail',
        method: 'post',
        authRequired: true,
        roles: [],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', TRUE)
            .select('lat', 'lng', 'distance')
            .first();

        let location = {};

        if (!detail) {
            location = await mapSerivce.getLocation(ctx.request.ip);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                location
            }
        };
    }
};

export default PcSignSettingDetailAction;
