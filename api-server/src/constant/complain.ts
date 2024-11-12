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

export const COMPLAIN = 1;
export const SUGGEST = 2;

// 投诉类型
export const COMPLAIN_HEALTH = 1;
export const COMPLAIN_NOISE = 2;
export const COMPLAIN_SERVICE = 3;
export const COMPLAIN_BUILDING = 4;
export const COMPLAIN_FIRE_ACCESS = 5;
export const COMPLAIN_COMMUNITY_FACILITY = 6;
export const COMPLAIN_OTHER = 7;

// 业主提交 客服调拨 指派人员处理 完成
// 1 已提交，待客服响应
// 2 分配xxx进行进行处理
// 3 指派人员处理正在处理
// 4 完成

export const SUBMIT_COMPLAIN_STEP = 1;
export const ALLOT_COMPLAIN_STEP = 2;
export const CONFIRM_COMPLAIN_STEP = 3;
export const FINISH_COMPLAIN_STEP = 4;
