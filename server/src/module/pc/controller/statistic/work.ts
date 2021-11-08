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
import utils from '~/utils';
import * as ROLE from '~/constant/role_access';
import { FINISH_REPAIR_STEP } from '~/constant/repair';
import { FINISH_COMPLAIN_STEP } from '~/constant/complain';
import { TRUE, FALSE } from '~/constant/status';
import { WORKFLOW_NODE_APPROVER } from '~/constant/workflow';
import moment from 'moment';

interface RequestBody {
    community_id: number;
}

const StatisticWorkAction = <Action>{
    router: {
        path: '/statistic/work',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const now = Date.now();

        const repair_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_repair')
                .where('community_id', community_id)
                .whereNull('merge_id')
                .andWhere('dispose_user_id', ctx.pcUserInfo.id)
                .andWhere('step', '<>', FINISH_REPAIR_STEP)
                .count()
        );

        const complain_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_complain')
                .where('community_id', community_id)
                .whereNull('merge_id')
                .andWhere('dispose_user_id', ctx.pcUserInfo.id)
                .andWhere('step', '<>', FINISH_COMPLAIN_STEP)
                .count()
        );

        const mission_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_mission')
                .where('community_id', community_id)
                .andWhere('user_id', ctx.pcUserInfo.id)
                .andWhere('start_date', '<=', now)
                .andWhere('end_date', '>=', now)
                .andWhere('cancel', FALSE)
                .whereNotIn('id', function() {
                    this.from('ejyy_mission_complete')
                        .where('created_by', ctx.pcUserInfo.id)
                        .andWhere('finish', TRUE)
                        .andWhere(
                            'date',
                            moment()
                                .startOf('day')
                                .valueOf()
                        )
                        .select('mission_id');
                })
                .count()
        );

        const leave_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_ask_for_leave_flow')
                .leftJoin('ejyy_ask_for_leave', 'ejyy_ask_for_leave.id', 'ejyy_ask_for_leave_flow.parent_id')
                .where('ejyy_ask_for_leave.community_id', community_id)
                .whereNull('ejyy_ask_for_leave.success')
                .andWhere('ejyy_ask_for_leave.cancel', FALSE)
                .andWhere('ejyy_ask_for_leave_flow.node_type', WORKFLOW_NODE_APPROVER)
                .andWhere('ejyy_ask_for_leave_flow.relation_user_id', ctx.pcUserInfo.id)
                .andWhere('ejyy_ask_for_leave_flow.finish', FALSE)
                .count()
        );

        const refound_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_refound_flow')
                .leftJoin('ejyy_refound', 'ejyy_refound.id', 'ejyy_refound_flow.parent_id')
                .where('ejyy_refound.community_id', community_id)
                .whereNull('ejyy_refound.success')
                .andWhere('ejyy_refound.cancel', FALSE)
                .andWhere('ejyy_refound_flow.node_type', WORKFLOW_NODE_APPROVER)
                .andWhere('ejyy_refound_flow.relation_user_id', ctx.pcUserInfo.id)
                .andWhere('ejyy_refound_flow.finish', FALSE)
                .count()
        );

        const purchase_total = utils.sql.countReader(
            await ctx.model
                .from('ejyy_material_purchase_flow')
                .leftJoin(
                    'ejyy_material_purchase',
                    'ejyy_material_purchase.id',
                    'ejyy_material_purchase_flow.parent_id'
                )
                .where('ejyy_material_purchase.community_id', community_id)
                .whereNull('ejyy_material_purchase.success')
                .andWhere('ejyy_material_purchase.cancel', FALSE)
                .andWhere('ejyy_material_purchase_flow.node_type', WORKFLOW_NODE_APPROVER)
                .andWhere('ejyy_material_purchase_flow.relation_user_id', ctx.pcUserInfo.id)
                .andWhere('ejyy_material_purchase_flow.finish', FALSE)
                .count()
        );

        const meeting = await ctx.model
            .from('ejyy_meeting')
            .leftJoin('ejyy_meeting_room', 'ejyy_meeting_room.id', 'ejyy_meeting.meeting_room_id')
            .where('ejyy_meeting.community_id', community_id)
            .andWhere(
                'ejyy_meeting.start_time',
                '>=',
                moment()
                    .startOf('day')
                    .valueOf()
            )
            .andWhere(
                'ejyy_meeting.start_time',
                '<=',
                moment()
                    .endOf('day')
                    .valueOf()
            )
            .andWhere(function() {
                this.where('ejyy_meeting.created_by', ctx.pcUserInfo.id).orWhereIn('ejyy_meeting.id', function() {
                    this.from('ejyy_meeting_participant')
                        .where('user_id', ctx.pcUserInfo.id)
                        .select('meeting_id');
                });
            })
            .select(
                'ejyy_meeting.id',
                'ejyy_meeting.start_time',
                'ejyy_meeting.end_time',
                'ejyy_meeting_room.name',
                'ejyy_meeting_room.local'
            );

        const party = await ctx.model
            .from('ejyy_party')
            .andWhere('carousel', TRUE)
            .select('id', 'title', 'cover_img');

        const inform = await ctx.model
            .from('ejyy_inform')
            .andWhere('carousel', TRUE)
            .select('id', 'title', 'cover_img');

        const login = await ctx.model
            .from('ejyy_property_company_user_login')
            .where('property_company_user_id', ctx.pcUserInfo.id)
            .select('ip', 'user_agent', 'login_at')
            .limit(10)
            .offset(0)
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                repair_total,
                complain_total,
                mission_total,
                leave_total,
                refound_total,
                purchase_total,
                meeting,
                party,
                inform,
                login
            }
        };
    }
};

export default StatisticWorkAction;
