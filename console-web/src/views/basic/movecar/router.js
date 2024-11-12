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
    path: 'movecar',
    meta: {
        title: '小区挪车',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'movecar',
        roles: [ROLES.XQNC]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '挪车请求',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XQNC]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '挪车详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.XQNC]
            },
            component: () => import('./detail')
        }
    ]
};
