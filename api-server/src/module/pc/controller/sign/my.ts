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
import moment from 'moment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const PcSignMyAction = <Action>{
    router: {
        path: '/sign/my',
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

        const date = moment()
            .startOf('day')
            .valueOf();

        const list = await ctx.model
            .from('ejyy_employee_sign_record')
            .where('date', date)
            .andWhere('community_id', community_id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .select('begin', 'finish')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcSignMyAction;
