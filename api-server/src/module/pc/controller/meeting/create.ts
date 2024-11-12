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
import { SUCCESS, MEETING_TIME_REPEAT, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    theme: string;
    start_time: number;
    end_time: number;
    meeting_room_id: number;
    participants: number[];
}

const PcMeetingCreateAction = <Action>{
    router: {
        path: '/meeting/create',
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
                name: 'theme',
                max: 256,
                required: true
            },
            {
                name: 'start_time',
                regex: /^\d{13}$/,
                required: true
            },
            {
                name: 'end_time',
                regex: /^\d{13}$/,
                required: true
            },
            {
                name: 'meeting_room_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'participants',
                required: true,
                validator: val => Array.isArray(val) && val.every(id => /^\d+$/.test(id))
            }
        ]
    },
    response: async ctx => {
        const { start_time, end_time, theme, meeting_room_id, participants, community_id } = <RequestBody>(
            ctx.request.body
        );

        const existRoom = await ctx.model
            .from('ejyy_meeting_room')
            .where('community_id', community_id)
            .andWhere('id', meeting_room_id);

        if (!existRoom) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '会议室非法'
            });
        }

        const using = await ctx.model
            .from('ejyy_meeting')
            .where('meeting_room_id', meeting_room_id)
            .andWhere('community_id', community_id)
            .andWhere(function() {
                this.where(function() {
                    this.where('start_time', '<=', start_time).andWhere('end_time', '>', start_time);
                }).orWhere(function() {
                    this.where('start_time', '<', end_time).andWhere('end_time', '>=', end_time);
                });
            })
            .andWhere('cancel', FALSE)
            .first();

        if (using) {
            return (ctx.body = {
                code: MEETING_TIME_REPEAT,
                message: '该时间段会议室已被占用'
            });
        }

        const [id] = await ctx.model.from('ejyy_meeting').insert({
            start_time,
            end_time,
            theme,
            meeting_room_id,
            community_id,
            created_by: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        await ctx.model.from('ejyy_meeting_participant').insert(
            participants.map(user_id => {
                return {
                    user_id,
                    meeting_id: id
                };
            })
        );

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcMeetingCreateAction;
