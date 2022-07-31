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

import getters from './getters';
import mutations from './mutations';
import actions from './actions';

const state = {
    userInfo: {
        id: undefined,
        account: undefined,
        join_company_at: undefined,
        real_name: undefined,
        gender: 0,
        subscribed: false,
        avatar_url: undefined,
        created_at: undefined,
        access: [],
        admin: 0
    },
    postInfo: {
        job: undefined,
        department: undefined,
        community_list: [],
        default_community_id: undefined,
        wechat_payment: 0
    },
    waterMark: null,
    unreadNotices: []
};

export default { namespaced: true, state, getters, mutations, actions };
