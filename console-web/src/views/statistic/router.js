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
    path: '/statistic',
    meta: {
        title: '数据统计',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'statistic',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '物业缴费',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'payment',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./payment')
        },
        {
            path: 'pledge',
            meta: {
                title: '装修保证金',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'pledge',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./pledge')
        },
        {
            path: 'screen',
            meta: {
                title: '智慧大屏',
                authRequired: true,
                layout: null,
                nav: true,
                icon: 'screen',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./screen/index')
        }
    ]
};
