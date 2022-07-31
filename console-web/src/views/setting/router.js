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

module.exports = {
    path: '/setting',
    meta: {
        title: '系统设置',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'setting',
        // 空数组就是只有admin可以访问
        roles: []
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '组织结构',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'struct',
                roles: []
            },
            component: () => import('./organizational')
        },
        {
            path: 'access',
            meta: {
                title: '权限管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'promise',
                roles: []
            },
            component: () => import('./access')
        },
        {
            path: 'community',
            meta: {
                title: '小区管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'community',
                roles: []
            },
            component: () => import('./community'),
            children: [
                {
                    path: '',
                    meta: {
                        title: '全部小区',
                        authRequired: true,
                        layout: 'sider',
                        nav: true,
                        roles: []
                    },
                    component: () => import('./community/list')
                },
                {
                    path: 'detail/:id',
                    meta: {
                        title: '小区详情',
                        authRequired: true,
                        layout: 'sider',
                        nav: false,
                        roles: []
                    },
                    component: () => import('./community/detail')
                },
                {
                    path: 'update/:id',
                    meta: {
                        title: '更新小区',
                        authRequired: true,
                        layout: 'sider',
                        nav: false,
                        roles: []
                    },
                    component: () => import('./community/update')
                },
                {
                    path: 'create',
                    meta: {
                        title: '新增小区',
                        authRequired: true,
                        layout: 'sider',
                        nav: true,
                        roles: []
                    },
                    component: () => import('./community/create')
                }
            ]
        },
        {
            path: 'workflow',
            meta: {
                title: '流程管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'flow',
                roles: []
            },
            component: () => import('./workflow')
        },
        {
            path: 'sign',
            meta: {
                title: '考勤设置',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'sign',
                roles: []
            },
            component: () => import('./sign')
        },
        {
            path: 'tpl',
            meta: {
                title: '消息模板',
                authRequired: true,
                layout: 'sider',
                nav: true,
                icon: 'ios-mail-outline',
                roles: []
            },
            component: () => import('./tpl')
        }
    ]
};
