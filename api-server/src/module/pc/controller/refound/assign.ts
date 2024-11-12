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
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    id: number;
    node_id: number;
    community_id: number;
    relation_user_id: number;
}

const PcRefoundAssignction = <Action>{
    router: {
        path: '/refound/assign',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'node_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'relation_user_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, node_id, relation_user_id, community_id } = <RequestBody>ctx.request.body;

        const flowInfo = await ctx.model
            .from('ejyy_refound')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!flowInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改流程'
            });
        }

        const flowNode = await ctx.model
            .from('ejyy_refound_flow')
            .where('parent_id', id)
            .andWhere('id', node_id)
            .first();

        if (
            !flowNode ||
            flowNode.step !== flowInfo.step ||
            flowNode.finish === TRUE ||
            flowNode.applicant_assign === FALSE
        ) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改流程'
            });
        }

        await ctx.model
            .from('ejyy_refound_flow')
            .update({ relation_user_id })
            .where('id', node_id);

        // 推送审批

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcRefoundAssignction;
