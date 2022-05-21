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

// 流程类型
// 请假
export const LEAVE_WORKFLOW = 1;
// 报销
export const REFOUND_WORKFLOW = 2;
// 采购
export const PURCHASE_WORKFLOW = 3;

// 节点类型
// 发起人节点
export const WORKFLOW_NODE_INITIATE = 1;
// 审批人节点
export const WORKFLOW_NODE_APPROVER = 2;
// 抄送接送
export const WORKFLOW_NODE_NOTICE = 3;
// 条件节点
export const WORKFLOW_NODE_CONDITION = 4;
// 判断节点 路由节点
export const WORKFLOW_NODE_JUDGE = 5;

// 运算关系
// 小于
export const OPT_LT = 1;
// 大于
export const OPT_GT = 2;
// 小于等于
export const OPT_LT_EQUAL = 3;
// 等于
export const EQUAL = 4;
// 大于等于
export const OPT_GT_EQUAL = 5;
// 介于连个数质检
export const OPT_BETWEEN = 6;

// 判断分类
export const CONDITION_DEPARMENT = 1;
export const CONDITION_NUMBER = 2;
