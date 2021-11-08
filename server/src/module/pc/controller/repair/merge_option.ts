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
import { SUBMIT_REPAIR_STEP } from '~/constant/repair';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcRepairMergeOptionAction = <Action>{
    router: {
        path: '/repair/merge_option',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WXWF],
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

        const detail = await ctx.model
            .from('ejyy_repair')
            .whereNull('merge_id')
            .andWhere('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', SUBMIT_REPAIR_STEP)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const list = await ctx.model
            .from('ejyy_repair')
            .whereNull('merge_id')
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .andWhere('created_at', '<=', detail.created_at + 1000 * 60 * 60 * 24)
            .andWhere('created_at', '>=', detail.created_at - 1000 * 60 * 60 * 24)
            .andWhereNot('step', SUBMIT_REPAIR_STEP)
            .select('id', 'description', 'repair_type', 'step', 'created_at');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcRepairMergeOptionAction;
