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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcMeetingCancelAction = <Action>{
    router: {
        path: '/meeting/cancel',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_meeting')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的会议'
            });
        }

        if (info.start_time <= Date.now() || info.cancel === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '会议已逾期，不可取消'
            });
        }

        await ctx.model
            .from('ejyy_meeting')
            .update('cancel', TRUE)
            .where('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMeetingCancelAction;
