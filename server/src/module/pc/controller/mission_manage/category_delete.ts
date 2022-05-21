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
import { SUCCESS, STATUS_ERROR, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParmas {
    id: number;
}

const PcMissionManageCategoryDeleteAction = <Action>{
    router: {
        path: '/mission_manage/category_delete/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.XJRW]
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParmas>ctx.params;

        const exist = await ctx.model
            .from('ejyy_mission_category')
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的任务分类'
            });
        }

        const pointUsed = await ctx.model
            .from('ejyy_mission_point')
            .where('category_id', id)
            .first();

        if (pointUsed) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检点正在使用该分类，不可删除'
            });
        }

        const lineUsed = await ctx.model
            .from('ejyy_mission_line')
            .where('category_id', id)
            .first();

        if (lineUsed) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检路线正在使用该分类，不可删除'
            });
        }

        const missionUsed = await ctx.model
            .from('ejyy_mission')
            .where('category_id', id)
            .first();

        if (missionUsed) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检任务正在使用该分类，不可删除'
            });
        }

        await ctx.model
            .from('ejyy_mission_category')
            .where('id', id)
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMissionManageCategoryDeleteAction;
