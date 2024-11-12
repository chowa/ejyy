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
    path: 'order',
    meta: {
        title: '我的工单',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'order',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    redirect: '/oa/order/repair',
    children: [require('./repair/router'), require('./complain/router')]
};
