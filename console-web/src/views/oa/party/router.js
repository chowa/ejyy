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
    path: 'party',
    meta: {
        title: '党建党讯',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'party',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部文章',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./main')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '文章详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '发布文章',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.DJDX]
            },
            component: () => import('./create')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改文章',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.DJDX]
            },
            component: () => import('./update')
        },
        {
            path: 'manage',
            meta: {
                title: '文章管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.DJDX]
            },
            component: () => import('./manage')
        }
    ]
};
