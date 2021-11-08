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
    path: 'mission',
    meta: {
        title: '巡检任务',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'mission',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部任务',
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
                title: '任务详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./detail')
        },
        {
            path: 'submit/:id',
            meta: {
                title: '任务提交',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./submit')
        },
        {
            path: 'dispose',
            meta: {
                title: '分配任务',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XJRW]
            },
            component: () => import('./dispose')
        },
        {
            path: 'line',
            meta: {
                title: '巡检路线',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XJRW]
            },
            component: () => import('./line')
        },
        {
            path: 'point',
            meta: {
                title: '巡检点位',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XJRW]
            },
            component: () => import('./point')
        },
        {
            path: 'category',
            meta: {
                title: '巡检分类',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XJRW]
            },
            component: () => import('./category')
        }
    ]
};
