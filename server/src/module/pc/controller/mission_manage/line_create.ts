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
import { SUCCESS, MISSION_LINE_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    name: string;
    description: string;
    category_id: number;
    community_id: number;
    points: number[];
}

const PcMissionManageLineCreateAction = <Action>{
    router: {
        path: '/mission_manage/line_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'description',
                max: 256,
                required: true
            },
            {
                name: 'category_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'points',
                required: true,
                min: 1,
                validator: val => Array.isArray(val) && val.every(id => /^\d+$/.test(id))
            }
        ]
    },
    response: async ctx => {
        const { name, description, category_id, community_id, points } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_mission_line')
            .where('community_id', community_id)
            .andWhere('name', name)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MISSION_LINE_EXIST,
                message: '巡检路线已存在'
            });
        }

        const category = await ctx.model
            .from('ejyy_mission_category')
            .where('id', category_id)
            .first();

        if (!category) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的任务分类'
            });
        }

        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_mission_line').insert({
            name,
            description,
            category_id,
            community_id,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        await ctx.model.from('ejyy_mission_line_node').insert(
            points.map(point_id => {
                return {
                    point_id,
                    line_id: id
                };
            })
        );

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcMissionManageLineCreateAction;
