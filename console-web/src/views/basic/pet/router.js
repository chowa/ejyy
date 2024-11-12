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
    path: 'pet',
    meta: {
        title: '宠物档案',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'pet',
        roles: [ROLES.CWDA]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部档案',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CWDA]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '宠物详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.CWDA]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '创建档案',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CWDA]
            },
            component: () => import('./create')
        }
    ]
};
