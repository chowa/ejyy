/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    LEAVE_WORKFLOW,
    REFOUND_WORKFLOW,
    PURCHASE_WORKFLOW,
    WORKFLOW_NODE_INITIATE,
    WORKFLOW_NODE_APPROVER,
    WORKFLOW_NODE_NOTICE,
    WORKFLOW_NODE_JUDGE,
    WORKFLOW_NODE_CONDITION,
    CONDITION_DEPARMENT,
    CONDITION_NUMBER,
    OPT_LT,
    OPT_GT,
    OPT_LT_EQUAL,
    EQUAL,
    OPT_GT_EQUAL,
    OPT_BETWEEN
} from '~/constant/workflow';
import { InitiateNode, ApproverNode, NoticeNode, ConditionNode, JudgeNode } from '~/types/workflow';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    type: typeof LEAVE_WORKFLOW | typeof REFOUND_WORKFLOW | typeof PURCHASE_WORKFLOW;
    node: InitiateNode;
}

const PcWorkflowCreateAction = <Action>{
    router: {
        path: '/workflow/create',
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
            },
            {
                name: 'node',
                required: true,
                validator: (val: InitiateNode) => {
                    if (val.type !== WORKFLOW_NODE_INITIATE) {
                        return false;
                    }

                    if (
                        !Array.isArray(val.from_user_ids) ||
                        !val.from_user_ids.every(id => /^\d+$/.test(id.toString()))
                    ) {
                        return false;
                    }

                    if (
                        !Array.isArray(val.from_deparment_ids) ||
                        !val.from_deparment_ids.every(id => /^\d+$/.test(id.toString()))
                    ) {
                        return false;
                    }

                    if (!val.next) {
                        return false;
                    }

                    let hadApprover = false;

                    const verifyNext = (nextNode: ApproverNode | NoticeNode | ConditionNode | JudgeNode): boolean => {
                        switch (nextNode.type) {
                            case WORKFLOW_NODE_APPROVER:
                                const approverNode = <ApproverNode>nextNode;
                                if (approverNode.applicant_assign !== FALSE && approverNode.applicant_assign !== TRUE) {
                                    return false;
                                }
                                if (approverNode.applicant_assign === FALSE && !approverNode.relation_user_id) {
                                    return false;
                                }
                                hadApprover = true;
                                break;

                            case WORKFLOW_NODE_NOTICE:
                                const noticeNode = <NoticeNode>nextNode;
                                if (!noticeNode.relation_user_id) {
                                    return false;
                                }
                                break;

                            case WORKFLOW_NODE_JUDGE:
                                const judgeNode = <JudgeNode>nextNode;

                                if (!Array.isArray(judgeNode.condition_list) || judgeNode.condition_list.length < 2) {
                                    return false;
                                }

                                const conditionVeirfy = judgeNode.condition_list.every(condition =>
                                    verifyNext(condition)
                                );

                                if (!conditionVeirfy) {
                                    return false;
                                }
                                break;

                            case WORKFLOW_NODE_CONDITION:
                                const conditionNode = <ConditionNode>nextNode;

                                if (
                                    conditionNode.category !== CONDITION_DEPARMENT &&
                                    conditionNode.category !== CONDITION_NUMBER
                                ) {
                                    return false;
                                }

                                // 部门和数字逻辑判断第一个值都是整数，部门无需别的判断
                                if (
                                    !conditionNode.name ||
                                    conditionNode.name.length > 56 ||
                                    !Array.isArray(conditionNode.value) ||
                                    typeof conditionNode.value[0] !== 'number' ||
                                    conditionNode.value.length !== 2
                                ) {
                                    return false;
                                }

                                if (conditionNode.category === CONDITION_NUMBER) {
                                    if (
                                        ![OPT_LT, OPT_GT, OPT_LT_EQUAL, EQUAL, OPT_GT_EQUAL, OPT_BETWEEN].includes(
                                            conditionNode.opt
                                        )
                                    ) {
                                        return false;
                                    }

                                    if (conditionNode.opt === OPT_BETWEEN) {
                                        if (
                                            typeof conditionNode.value[1] !== 'number' ||
                                            (conditionNode.opt_first_equal !== TRUE &&
                                                conditionNode.opt_first_equal !== FALSE) ||
                                            (conditionNode.opt_second_equal !== TRUE &&
                                                conditionNode.opt_second_equal !== FALSE)
                                        ) {
                                            return false;
                                        }
                                    }
                                }

                                break;

                            default:
                                return false;
                        }

                        if (nextNode.next) {
                            return verifyNext(nextNode.next);
                        }

                        return true;
                    };

                    const verify = verifyNext(val.next);

                    if (!verify || !hadApprover) {
                        return false;
                    }

                    return true;
                }
            }
        ]
    },
    response: async ctx => {
        const { community_id, type, node } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_workflow')
            .where('community_id', community_id)
            .andWhere('type', type)
            .andWhere('latest', TRUE)
            .update('latest', FALSE);

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_workflow').insert({
            community_id,
            type,
            latest: TRUE,
            created_at
        });

        const insertNext = async (
            nextNode: ApproverNode | NoticeNode | ConditionNode | JudgeNode,
            parent_id: number
        ) => {
            let next_parent_id = null;

            switch (nextNode.type) {
                case WORKFLOW_NODE_APPROVER:
                    const approverNode = <ApproverNode>nextNode;

                    [next_parent_id] = await ctx.model.from('ejyy_workflow_node').insert({
                        workflow_id: id,
                        type: approverNode.type,
                        parent_id,
                        relation_user_id: approverNode.applicant_assign
                            ? null
                            : approverNode.relation_user_id
                            ? approverNode.relation_user_id
                            : null,
                        applicant_assign: approverNode.applicant_assign ? TRUE : FALSE,
                        created_at
                    });
                    break;

                case WORKFLOW_NODE_NOTICE:
                    const noticeNode = <NoticeNode>nextNode;

                    [next_parent_id] = await ctx.model.from('ejyy_workflow_node').insert({
                        workflow_id: id,
                        type: noticeNode.type,
                        parent_id,
                        relation_user_id: noticeNode.relation_user_id ? noticeNode.relation_user_id : null,
                        created_at
                    });
                    break;

                case WORKFLOW_NODE_JUDGE:
                    const judgeNode = <JudgeNode>nextNode;

                    [next_parent_id] = await ctx.model.from('ejyy_workflow_node').insert({
                        workflow_id: id,
                        type: judgeNode.type,
                        parent_id,
                        created_at
                    });

                    for (let item of judgeNode.condition_list) {
                        await insertNext(item as ConditionNode, next_parent_id);
                    }
                    break;

                case WORKFLOW_NODE_CONDITION:
                    const conditionNode = <ConditionNode>nextNode;

                    [next_parent_id] = await ctx.model.from('ejyy_workflow_node').insert({
                        workflow_id: id,
                        type: conditionNode.type,
                        name: conditionNode.name,
                        category: conditionNode.category,
                        value: JSON.stringify(conditionNode.value),
                        opt: conditionNode.opt ? conditionNode.opt : null,
                        opt_first_equal: conditionNode.opt_first_equal ? conditionNode.opt_first_equal : null,
                        opt_second_equal: conditionNode.opt_second_equal ? conditionNode.opt_second_equal : null,
                        parent_id,
                        created_at
                    });
                    break;
            }

            if (nextNode.next) {
                await insertNext(nextNode.next, next_parent_id);
            }
        };

        const [initId] = await ctx.model.from('ejyy_workflow_node').insert({
            workflow_id: id,
            type: node.type,
            from_user_ids: JSON.stringify(node.from_user_ids),
            from_deparment_ids: JSON.stringify(node.from_deparment_ids),
            parent_id: null,
            created_at
        });

        await insertNext(node.next, initId);

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcWorkflowCreateAction;
