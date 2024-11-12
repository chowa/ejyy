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
    path: 'leave',
    meta: {
        title: '工作请假',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'leave',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '申请请假',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./apply')
        },
        {
            path: 'flow',
            meta: {
                title: '审批流程',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./flow')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '请假详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./detail')
        }
    ]
};
