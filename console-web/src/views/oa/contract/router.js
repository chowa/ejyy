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
    path: 'contract',
    meta: {
        title: '合同管理',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'contract',
        roles: [ROLES.HTGL]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部合同',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HTGL]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '新建合同',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HTGL]
            },
            component: () => import('./create')
        },
        {
            path: 'category',
            meta: {
                title: '合同类别',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HTGL]
            },
            component: () => import('./category')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改合同',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.HTGL]
            },
            component: () => import('./update')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '修改详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.HTGL]
            },
            component: () => import('./detail')
        }
    ]
};
