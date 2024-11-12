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
    path: 'finance',
    meta: {
        title: '物业收费',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'finance',
        roles: [ROLES.CWGL]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '收费记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CWGL]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '创建收费',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CWGL]
            },
            component: () => import('./create')
        },
        {
            path: 'order/:id',
            meta: {
                title: '已缴费订单',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.CWGL]
            },
            component: () => import('./order')
        },
        {
            path: 'unpay/:id',
            meta: {
                title: '未缴费房产',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.CWGL]
            },
            component: () => import('./unpay')
        },
        {
            path: 'pay/:id',
            meta: {
                title: '现场缴费',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.CWGL]
            },
            component: () => import('./pay')
        }
    ]
};
