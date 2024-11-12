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
    path: 'park',
    meta: {
        title: '智慧停车',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'park',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '通行记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'blacklist',
            meta: {
                title: '黑名单管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHTC]
            },
            component: () => import('./blacklist')
        },
        {
            path: 'manage',
            meta: {
                title: '停车场管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHTC]
            },
            component: () => import('./manage')
        }
    ]
};
