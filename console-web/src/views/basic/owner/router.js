/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'owner',
    meta: {
        title: '业主档案',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'owner',
        roles: [ROLES.YZDA]
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
                roles: [ROLES.YZDA]
            },
            component: () => import('./main/list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '业主详情',
                authRequired: true,
                layout: 'sider',
                roles: [ROLES.YZDA]
            },
            component: () => import('./main/detail')
        },
        {
            path: 'approve',
            meta: {
                title: '现场认证',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.YZDA]
            },
            component: () => import('./main/approve')
        },
        {
            path: 'apply',
            meta: {
                title: '认证申请',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.YZDA]
            },
            component: () => import('./apply'),
            children: [
                {
                    path: '',
                    meta: {
                        title: '申请列表',
                        authRequired: true,
                        layout: 'sider',
                        nav: false,
                        roles: [ROLES.YZDA]
                    },
                    component: () => import('./apply/list')
                },
                {
                    path: 'detail/:id',
                    meta: {
                        title: '申请详情',
                        authRequired: true,
                        layout: 'sider',
                        nav: false,
                        roles: [ROLES.YZDA]
                    },
                    component: () => import('./apply/detail')
                }
            ]
        }
    ]
};
