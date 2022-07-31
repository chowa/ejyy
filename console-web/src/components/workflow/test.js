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

export default {
    // 发起人
    id: 1,
    type: 1,
    relation_user_id: null,
    condition_list: null,
    next: {
        id: 2,
        type: 5,
        condition_list: [
            {
                id: 3,
                type: 4,
                name: '部门',
                field: 'deparment_id',
                value: 1,
                next: {
                    id: 6,
                    type: 2,
                    applicant_assign: 0,
                    relation_user_id: 3
                }
            },
            {
                id: 6,
                type: 4,
                name: '部门',
                field: 'deparment_id',
                value: 1
            }
        ],
        next: {
            id: 10,
            type: 3,
            relation_user_id: 4
        }
    }
};
