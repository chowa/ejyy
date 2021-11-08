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
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcMeetingDetailAction = <Action>{
    router: {
        path: '/meeting/detail',
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
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_meeting.created_by')
            .leftJoin('ejyy_meeting_room', 'ejyy_meeting_room.id', 'ejyy_meeting.meeting_room_id')
            .where('ejyy_meeting.id', id)
            .andWhere('ejyy_meeting.community_id', community_id)
            .select(
                'ejyy_meeting.id',
                'ejyy_meeting.start_time',
                'ejyy_meeting.end_time',
                'ejyy_meeting.theme',
                'ejyy_meeting.cancel',
                'ejyy_meeting.created_by',
                'ejyy_meeting.created_at',
                'ejyy_property_company_user.real_name',
                'ejyy_meeting_room.name',
                'ejyy_meeting_room.local',
                'ejyy_meeting_room.have_tv',
                'ejyy_meeting_room.have_board',
                'ejyy_meeting_room.have_projector'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的会议'
            });
        }

        const participant = await ctx.model
            .from('ejyy_meeting_participant')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_meeting_participant.user_id')
            .where('ejyy_meeting_participant.meeting_id', id)
            .select('ejyy_meeting_participant.user_id', 'ejyy_property_company_user.real_name');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                participant
            }
        };
    }
};

export default PcMeetingDetailAction;
