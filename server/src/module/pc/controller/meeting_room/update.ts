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
import { SUCCESS, MEETING_ROOM_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    id: number;
    name: string;
    local: string;
    have_tv: typeof TRUE | typeof FALSE;
    have_board: typeof TRUE | typeof FALSE;
    have_projector: typeof TRUE | typeof FALSE;
}

const PcMeetingRoomUpdateAction = <Action>{
    router: {
        path: '/meeting_room/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HYSGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'local',
                max: 128,
                required: true
            },
            {
                name: 'have_tv',
                regex: /^0|1$/,
                required: true
            },
            {
                name: 'have_board',
                regex: /^0|1$/,
                required: true
            },
            {
                name: 'have_projector',
                regex: /^0|1$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, name, local, community_id, have_tv, have_board, have_projector } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_meeting_room')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        const repeat = await ctx.model
            .from('ejyy_meeting_room')
            .where('community_id', community_id)
            .andWhere('name', name)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MEETING_ROOM_EXIST,
                message: '会议室已存在'
            });
        }

        await ctx.model
            .from('ejyy_meeting_room')
            .update({
                name,
                local,
                have_tv,
                have_board,
                have_projector
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMeetingRoomUpdateAction;
