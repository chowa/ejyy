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
import { TRUE } from '~/constant/status';
import * as mapSerivce from '~/service/map';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const PcOptionLocationAction = <Action>{
    router: {
        path: '/option/location',
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
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', TRUE)
            .select('lat', 'lng')
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

export default PcOptionLocationAction;
