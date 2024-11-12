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

import Knex from 'knex';
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
import { TRUE, FALSE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import { OA_NOTICE_WORKFLOW_APPROVER, OA_NOTICE_WORKFLOW_RESULT } from '~/constant/tpl';
import { InitiateNode, ApproverNode, NoticeNode, ConditionNode, JudgeNode } from '~/types/workflow';
import config from '~/config';
import { PcUserInfo } from '~/types/user-info';
import cwlog from 'chowa-log';

function initNode(): InitiateNode {
    return {
        id: undefined,
        type: WORKFLOW_NODE_INITIATE,
        from_user_ids: [],
        from_deparment_ids: [],
        error: false,
        next: <JudgeNode>{
            id: undefined,
            type: WORKFLOW_NODE_JUDGE,
            condition_list: [
                <ConditionNode>{
                    id: undefined,
                    type: WORKFLOW_NODE_CONDITION,
                    name: '条件1',
                    category: undefined,
                    value: [null, null],
                    opt: undefined,
                    opt_first_equal: FALSE,
                    opt_second_equal: FALSE,
                    error: true,
                    next: <ApproverNode>{
                        type: WORKFLOW_NODE_APPROVER,
                        relation_user_id: undefined,
                        error: true
                    }
                },
                <ConditionNode>{
                    id: undefined,
                    type: WORKFLOW_NODE_CONDITION,
                    name: '条件2',
                    category: undefined,
                    value: [null, null],
                    opt: undefined,
                    opt_first_equal: FALSE,
                    opt_second_equal: FALSE,
                    error: true,
                    next: <ApproverNode>{
                        type: WORKFLOW_NODE_APPROVER,
                        relation_user_id: undefined,
                        error: true
                    }
                }
            ],
            error: false,
            next: <NoticeNode>{
                id: undefined,
                type: WORKFLOW_NODE_NOTICE,
                relation_user_id: undefined,
                error: true
            }
        }
    };
}

export async function getNode(
    model: Knex,
    community_id: number,
    type: typeof LEAVE_WORKFLOW | typeof REFOUND_WORKFLOW | typeof PURCHASE_WORKFLOW
): Promise<InitiateNode> {
    const workflowInfo = await model
        .from('ejyy_workflow')
        .where('community_id', community_id)
        .andWhere('type', type)
        .andWhere('latest', TRUE)
        .first();

    if (!workflowInfo) {
        return initNode();
    }

    const records = await model.from('ejyy_workflow_node').where('workflow_id', workflowInfo.id);

    const findInitRecord = () => {
        const index = records.findIndex(record => record.type === WORKFLOW_NODE_INITIATE);
        return records[index];
    };

    const initRecord = findInitRecord();

    const findCondition = (parent_id: number): ConditionNode[] => {
        const ret = [];

        records.forEach(record => {
            if (record.type === WORKFLOW_NODE_CONDITION && record.parent_id === parent_id) {
                ret.push(<ConditionNode>{
                    id: record.id,
                    type: WORKFLOW_NODE_CONDITION,
                    name: record.name,
                    category: record.category,
                    value: JSON.parse(record.value as string),
                    opt: record.opt,
                    opt_first_equal: record.opt_first_equal,
                    opt_second_equal: record.opt_second_equal,
                    next: findNext(record.id),
                    error: false
                });
            }
        });

        return ret;
    };

    const findNext = (parent_id: number): ApproverNode | NoticeNode | JudgeNode => {
        const index = records.findIndex(
            record => record.parent_id === parent_id && record.type !== WORKFLOW_NODE_CONDITION
        );

        if (index < 0) {
            return undefined;
        }

        const record = records[index];

        switch (record.type) {
            case WORKFLOW_NODE_APPROVER:
                return <ApproverNode>{
                    id: record.id,
                    type: WORKFLOW_NODE_APPROVER,
                    relation_user_id: record.relation_user_id,
                    applicant_assign: record.applicant_assign,
                    next: findNext(record.id),
                    error: false
                };

            case WORKFLOW_NODE_NOTICE:
                return <NoticeNode>{
                    id: record.id,
                    type: WORKFLOW_NODE_NOTICE,
                    relation_user_id: record.relation_user_id,
                    next: findNext(record.id),
                    error: false
                };

            case WORKFLOW_NODE_JUDGE:
                return <JudgeNode>{
                    id: record.id,
                    type: WORKFLOW_NODE_JUDGE,
                    condition_list: findCondition(record.id),
                    next: findNext(record.id),
                    error: false
                };

            default:
                return undefined;
        }
    };

    return <InitiateNode>{
        workflow_id: workflowInfo.id,
        id: initRecord.id,
        type: WORKFLOW_NODE_INITIATE,
        from_user_ids: JSON.parse(initRecord.from_user_ids as string),
        from_deparment_ids: JSON.parse(initRecord.from_deparment_ids as string),
        next: findNext(initRecord.id),
        error: false
    };
}

interface WorkflowStep {
    step: number;
    node_type: typeof WORKFLOW_NODE_APPROVER | typeof WORKFLOW_NODE_CONDITION | typeof WORKFLOW_NODE_NOTICE;
    workflow_node_id: number;
    relation_user_id?: number;
    applicant_assign: typeof TRUE | typeof FALSE;
    finish: typeof TRUE | typeof FALSE;
}

interface GenerateWorkflowStep {
    workflow_id: number;
    steps: WorkflowStep[];
    currentStep: number;
}

export async function generateSteps(
    model: Knex,
    userInfo: PcUserInfo,
    total: number,
    community_id: number,
    type: typeof LEAVE_WORKFLOW | typeof REFOUND_WORKFLOW | typeof PURCHASE_WORKFLOW
): Promise<GenerateWorkflowStep> {
    const node = await getNode(model, community_id, type);

    // 不存在流程
    if (node.next.error || !node.id) {
        return { workflow_id: undefined, steps: [], currentStep: undefined };
    }

    // 流程不适用
    if (
        (node.from_user_ids.length > 0 && !node.from_user_ids.includes(userInfo.id)) ||
        (node.from_deparment_ids.length > 0 && node.from_deparment_ids.includes(userInfo.department_id))
    ) {
        return { workflow_id: undefined, steps: [], currentStep: undefined };
    }

    const ret = <WorkflowStep[]>[];
    let step = 1;

    const compuitedJudge = (list: ConditionNode[]) => {
        list.every(conditionNode => {
            if (conditionNode.category === CONDITION_DEPARMENT) {
                const department_id = conditionNode.value[0];

                if (userInfo.department_id === department_id) {
                    ret.push({
                        step,
                        node_type: WORKFLOW_NODE_CONDITION,
                        workflow_node_id: conditionNode.id,
                        relation_user_id: null,
                        applicant_assign: FALSE,
                        finish: FALSE
                    });

                    step++;

                    if (conditionNode.next) {
                        computedStep(conditionNode.next);
                    }

                    return false;
                } else {
                    return true;
                }
            } else if (conditionNode.category === CONDITION_NUMBER) {
                const val1 = conditionNode.value[0];
                const val2 = conditionNode.value[1];

                // 取反
                switch (conditionNode.opt) {
                    case OPT_LT:
                        if (total >= val1) {
                            return true;
                        }
                        break;

                    case OPT_GT:
                        if (total <= val1) {
                            return true;
                        }
                        break;

                    case OPT_LT_EQUAL:
                        if (total > val1) {
                            return true;
                        }
                        break;

                    case EQUAL:
                        if (total !== val1) {
                            return true;
                        }
                        break;

                    case OPT_GT_EQUAL:
                        if (total < val1) {
                            return true;
                        }
                        break;

                    case OPT_BETWEEN:
                        // total > val1 && total < val2
                        if (conditionNode.opt_first_equal && !conditionNode.opt_second_equal) {
                            if (total < val1 || total >= val2) {
                                return true;
                            }
                        } else if (!conditionNode.opt_first_equal && conditionNode.opt_second_equal) {
                            if (total <= val1 || total > val2) {
                                return true;
                            }
                        } else if (conditionNode.opt_first_equal && conditionNode.opt_second_equal) {
                            if (total < val1 || total > val2) {
                                return true;
                            }
                        } else {
                            if (total <= val1 || total >= val2) {
                                return true;
                            }
                        }
                        break;

                    default:
                        return true;
                }

                ret.push({
                    step,
                    node_type: WORKFLOW_NODE_CONDITION,
                    workflow_node_id: conditionNode.id,
                    relation_user_id: null,
                    applicant_assign: FALSE,
                    finish: FALSE
                });

                if (conditionNode.next) {
                    step++;
                    computedStep(conditionNode.next);
                }

                return false;
            }

            return true;
        });
    };

    const computedStep = (nextNode: ApproverNode | NoticeNode | JudgeNode) => {
        switch (nextNode.type) {
            case WORKFLOW_NODE_APPROVER:
                const aproverNode = <ApproverNode>nextNode;

                ret.push({
                    step,
                    node_type: WORKFLOW_NODE_APPROVER,
                    workflow_node_id: aproverNode.id,
                    relation_user_id: aproverNode.relation_user_id,
                    applicant_assign: aproverNode.applicant_assign,
                    finish: FALSE
                });
                break;

            case WORKFLOW_NODE_NOTICE:
                const noticeNode = <NoticeNode>nextNode;

                ret.push({
                    step,
                    node_type: WORKFLOW_NODE_NOTICE,
                    workflow_node_id: noticeNode.id,
                    relation_user_id: noticeNode.relation_user_id,
                    applicant_assign: FALSE,
                    finish: FALSE
                });
                break;

            case WORKFLOW_NODE_JUDGE:
                const judgeNode = <JudgeNode>nextNode;

                compuitedJudge(judgeNode.condition_list);
                break;
        }

        if (nextNode.next) {
            step++;
            computedStep(nextNode.next);
        }
    };

    computedStep(node.next);

    let currentStep = undefined;

    ret.every((step, index) => {
        if (step.node_type === WORKFLOW_NODE_APPROVER) {
            currentStep = step.step;
            return false;
        }

        ret[index].finish = TRUE;
        return true;
    });

    return {
        workflow_id: node.workflow_id,
        steps: ret,
        currentStep
    };
}

interface NoticeApproverParams {
    id: number;
    refer: 'leave' | 'purchase' | 'refound';
    title: string;
    relation_user_id: number;
    created_by: number;
    time: string;
    digest: string;
}

export async function noticeApprover(model: Knex, params: NoticeApproverParams) {
    const { id, refer, title, created_by, relation_user_id, time, digest } = params;

    const approverInfo = await model
        .from('ejyy_property_company_user')
        .leftJoin(
            'ejyy_wechat_official_accounts_user',
            'ejyy_wechat_official_accounts_user.union_id',
            'ejyy_property_company_user.union_id'
        )
        .where('ejyy_property_company_user.id', relation_user_id)
        .select('ejyy_wechat_official_accounts_user.open_id', 'ejyy_wechat_official_accounts_user.subscribed')
        .first();

    if (!approverInfo.subscribed) {
        return;
    }

    const createdInfo = await model
        .from('ejyy_property_company_user')
        .where('id', created_by)
        .first();

    return await wechatService.sendOaTemplateMessage({
        touser: approverInfo.open_id,
        template_id: OA_NOTICE_WORKFLOW_APPROVER,
        miniprogram: {
            appid: config.wechat.pmp.appid,
            pagepath: `/pages/${refer}/detail?id=${id}`
        },
        data: {
            first: {
                value: '您有一个流程待审批'
            },
            keyword1: {
                value: title
            },
            keyword2: {
                value: createdInfo.real_name
            },
            keyword3: {
                value: time
            },
            keyword4: {
                value: digest ? digest : '无'
            },
            remark: {
                value: '请尽快完成审批'
            }
        }
    });
}

interface NoticeResultParams {
    id: number;
    refer: 'leave' | 'purchase' | 'refound';
    success: typeof TRUE | typeof FALSE;
    reason?: string;
    created_by: number;
    time: string;
    digest: string;
}

export async function noticeResult(model: Knex, params: NoticeResultParams) {
    const { id, refer, success, reason, created_by, time, digest } = params;

    const createdInfo = await model
        .from('ejyy_property_company_user')
        .leftJoin(
            'ejyy_wechat_official_accounts_user',
            'ejyy_wechat_official_accounts_user.union_id',
            'ejyy_property_company_user.union_id'
        )
        .where('ejyy_property_company_user.id', created_by)
        .select('ejyy_wechat_official_accounts_user.open_id', 'ejyy_wechat_official_accounts_user.subscribed')
        .first();

    if (!createdInfo.subscribed) {
        return;
    }

    let category: string;

    switch (refer) {
        case 'leave':
            category = '请假申请';
            break;

        case 'refound':
            category = '报销申请';
            break;

        case 'purchase':
            category = '采购申请';
            break;

        default:
            category = '异常流程';
            cwlog.warning('未设置流程名分类');
    }

    return await wechatService.sendOaTemplateMessage({
        touser: createdInfo.open_id,
        template_id: OA_NOTICE_WORKFLOW_RESULT,
        miniprogram: {
            appid: config.wechat.pmp.appid,
            pagepath: `/pages/${refer}/detail?id=${id}`
        },
        data: {
            first: {
                value: '您有一个申请已完成审批'
            },
            keyword1: {
                value: category
            },
            keyword2: {
                value: digest ? digest : '无'
            },
            keyword3: {
                value: success ? '通过' : '驳回'
            },
            keyword4: {
                value: reason ? reason : '无'
            },
            keyword5: {
                value: time
            },
            remark: {
                value: '点击查看审批详情'
            }
        }
    });
}
