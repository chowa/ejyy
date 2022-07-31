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
    path: 'topic',
    meta: {
        authRequired: true,
        title: '专题管理',
        layout: 'sider',
        icon: 'topic',
        nav: true,
        roles: [ROLES.ZTGL]
    },
    component: () => import('./'),
    children: [
        {
            path: '',
            meta: {
                authRequired: true,
                title: '全部专题',
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZTGL]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                authRequired: true,
                title: '创建专题',
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZTGL]
            },
            component: () => import('./create')
        },
        {
            path: 'update/:id',
            meta: {
                authRequired: true,
                title: '修改专题',
                layout: 'sider',
                nav: false,
                roles: [ROLES.ZTGL]
            },
            component: () => import('./update')
        },
        {
            path: 'preview/:id',
            meta: {
                authRequired: true,
                title: '预览专题',
                layout: 'sider',
                nav: false,
                roles: [ROLES.ZTGL]
            },
            component: () => import('./preview')
        }
    ]
};
