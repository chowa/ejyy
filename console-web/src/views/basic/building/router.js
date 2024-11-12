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
    path: 'building',
    meta: {
        title: '房产档案',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'community',
        roles: [ROLES.FCDA]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部房产',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.FCDA]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '房产详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.FCDA]
            },
            component: () => import('./detail')
        },
        {
            path: 'import',
            meta: {
                title: '房产导入',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: []
            },
            component: () => import('./import')
        }
    ]
};
