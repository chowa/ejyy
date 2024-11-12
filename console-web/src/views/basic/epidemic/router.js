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
    path: 'epidemic',
    meta: {
        title: '疫情防控',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'xgfy',
        roles: [ROLES.YQFK]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '防控记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.YQFK]
            },
            component: () => import('./list')
        },
        {
            path: 'checkin',
            meta: {
                title: '防控登记',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.YQFK]
            },
            component: () => import('./create')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '防控信息',
                authRequired: true,
                layout: 'sider',
                roles: [ROLES.YQFK]
            },
            component: () => import('./detail')
        }
    ]
};
