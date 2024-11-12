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
    path: 'energy',
    meta: {
        title: '能耗管理',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'energy',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '人工抄表',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./main')
        },
        {
            path: 'meter',
            meta: {
                title: '仪表管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.NHGL]
            },
            component: () => import('./meter')
        },
        {
            path: 'repeater',
            meta: {
                title: '中继管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.NHGL]
            },
            component: () => import('./repeater')
        }
    ]
};
