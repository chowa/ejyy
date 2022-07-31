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
