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

import {
    WORKFLOW_NODE_INITIATE,
    WORKFLOW_NODE_APPROVER,
    WORKFLOW_NODE_CONDITION,
    WORKFLOW_NODE_JUDGE,
    WORKFLOW_NODE_NOTICE,
    OPT_LT,
    OPT_GT,
    OPT_LT_EQUAL,
    EQUAL,
    OPT_GT_EQUAL,
    OPT_BETWEEN,
    CONDITION_DEPARMENT,
    CONDITION_NUMBER
} from '~/constant/workflow';
import { TRUE, FALSE } from '~/constant/STATUS';

declare namespace Workflow {
    interface Node {
        id?: number;
        type:
            | typeof WORKFLOW_NODE_INITIATE
            | typeof WORKFLOW_NODE_APPROVER
            | typeof WORKFLOW_NODE_CONDITION
            | typeof WORKFLOW_NODE_JUDGE
            | typeof WORKFLOW_NODE_NOTICE;
        error?: boolean;
        next?: ApproverNode | NoticeNode | JudgeNode;
    }

    interface InitiateNode extends Node {
        workflow_id?: number;
        from_user_ids: number[];
        from_deparment_ids: number[];
    }

    interface ApproverNode extends Node {
        relation_user_id?: number;
        applicant_assign?: typeof TRUE | typeof FALSE;
    }

    interface NoticeNode extends Node {
        relation_user_id: number;
    }

    interface ConditionNode extends Node {
        name: string;
        category: typeof CONDITION_DEPARMENT | typeof CONDITION_NUMBER;
        value: [number, number];
        opt:
            | typeof OPT_LT
            | typeof OPT_GT
            | typeof OPT_LT_EQUAL
            | typeof EQUAL
            | typeof OPT_GT_EQUAL
            | typeof OPT_BETWEEN;
        opt_first_equal: typeof TRUE | typeof FALSE;
        opt_second_equal: typeof TRUE | typeof FALSE;
    }

    interface JudgeNode extends Node {
        condition_list: ConditionNode[];
    }
}

export = Workflow;
