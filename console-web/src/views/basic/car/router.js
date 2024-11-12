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
    path: 'car',
    meta: {
        title: '车辆管理',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'park',
        roles: [ROLES.CLGL]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部车辆',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CLGL]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '车辆详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.CLGL]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '录入车辆',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CLGL]
            },
            component: () => import('./create')
        }
    ]
};
