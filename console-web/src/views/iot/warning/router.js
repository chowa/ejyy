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
    path: 'warning',
    meta: {
        title: '智慧预警',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'warning',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '预警记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'manage',
            meta: {
                title: '中控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHYJ]
            },
            component: () => import('./manage')
        }
    ]
};
