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
import { TRUE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMissionCancelAction = <Action>{
    router: {
        path: '/mission/cancel',
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
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_mission')
            .where('community_id', community_id)
            .andWhere('id', id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法取消巡检任务'
            });
        }

        if (info.cancel === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检任务状态非法'
            });
        }

        const canceled_at = Date.now();

        await ctx.model
            .from('ejyy_mission')
            .update({
                cancel: TRUE,
                canceled_at
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '取消巡检任务成功',
            data: {
                canceled_at
            }
        };
    }
};

export default PcMissionCancelAction;
