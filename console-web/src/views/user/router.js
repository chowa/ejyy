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

const ROLES = require('@/constants/role');

module.exports = {
    path: '/user',
    meta: {
        authRequired: false,
        title: '用户',
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./'),
    children: [require('./init/router'), require('./login/router'), require('./zone/router')]
};
