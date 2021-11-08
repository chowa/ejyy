/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'repair',
    meta: {
        title: '维修维护',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'maintain',
        roles: [ROLES.WXWF]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部工单',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.WXWF]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '创建工单',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.WXWF]
            },
            component: () => import('./create')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '工单详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.WXWF]
            },
            component: () => import('./detail')
        }
    ]
};
