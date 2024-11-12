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
    path: 'fitment',
    meta: {
        title: '装修登记',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'fitment',
        roles: [ROLES.ZXDJ]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部装修',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZXDJ]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '装修详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ZXDJ]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '新建登记',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZXDJ]
            },
            component: () => import('./create')
        }
    ]
};
