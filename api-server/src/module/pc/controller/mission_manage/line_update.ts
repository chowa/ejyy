/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, MISSION_LINE_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    name: string;
    description: string;
    category_id: number;
    community_id: number;
    points: number[];
}

const PcMissionManageLineUpdateAction = <Action>{
    router: {
        path: '/mission_manage/line_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
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
        const { id, name, description, category_id, community_id, points } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_mission_line')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的巡检路线'
            });
        }

        const repeat = await ctx.model
            .from('ejyy_mission_line')
            .where('community_id', community_id)
            .andWhere('name', name)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
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

        await ctx.model
            .from('ejyy_mission_line')
            .update({
                name,
                description,
                category_id
            })
            .where('id', id);

        await ctx.model
            .from('ejyy_mission_line_node')
            .where('line_id', id)
            .delete();

        await ctx.model.from('ejyy_mission_line_node').insert(
            points.map(point_id => {
                return {
                    point_id,
                    line_id: id
                };
            })
        );

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMissionManageLineUpdateAction;
