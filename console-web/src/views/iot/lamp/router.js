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
    path: 'lamp',
    meta: {
        title: '智慧照明',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'lamp',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '工作记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'line',
            meta: {
                title: '线路管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHZM]
            },
            component: () => import('./line')
        },
        {
            path: 'manage',
            meta: {
                title: '灯控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHZM]
            },
            component: () => import('./manage')
        }
    ]
};
