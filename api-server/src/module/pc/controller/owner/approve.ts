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
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';
import { AUTHENTICTED_BY_PROPERTY_COMPANY } from '~/constant/authenticated_type';
import config from '~/config';

interface RequestBody {
    building_ids: number[];
    community_id: number;
}

const PcOwerApproveAction = <Action>{
    router: {
        path: '/owner/approve',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
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
                name: 'building_ids',
                required: true,
                min: 1,
                validator: val => Array.isArray(val) && val.every(item => /^\d+$/.test(item))
            }
        ]
    },
    response: async ctx => {
        const { community_id, building_ids } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_building_info')
            .where('community_id', community_id)
            .whereIn('id', building_ids)
            .select('id');

        if (list.length !== building_ids.length) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的固定资产信息'
            });
        }

        const res = utils.community.encrypt(building_ids, AUTHENTICTED_BY_PROPERTY_COMPANY, ctx.pcUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...res,
                expire: config.community.expire
            }
        };
    }
};

export default PcOwerApproveAction;
