/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { LEAVE_WORKFLOW, REFOUND_WORKFLOW, PURCHASE_WORKFLOW } from '~/constant/workflow';
import * as workflowService from '~/service/workflow';

interface RequestBody {
    community_id: number;
    type: typeof LEAVE_WORKFLOW | typeof REFOUND_WORKFLOW | typeof PURCHASE_WORKFLOW;
}

const PcWorkflowDetailAction = <Action>{
    router: {
        path: '/workflow/detail',
        method: 'post',
        authRequired: true,
        roles: [],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'type',
                required: true,
                regex: /^1|2|3$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, type } = <RequestBody>ctx.request.body;

        const node = await workflowService.getNode(ctx.model, community_id, type);

        ctx.body = {
            code: SUCCESS,
            data: {
                node
            }
        };
    }
};

export default PcWorkflowDetailAction;
