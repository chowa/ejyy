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
    path: 'lamp',
    meta: {
        title: '智慧照明',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'lamp',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '工作记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'line',
            meta: {
                title: '线路管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHZM]
            },
            component: () => import('./line')
        },
        {
            path: 'manage',
            meta: {
                title: '灯控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHZM]
            },
            component: () => import('./manage')
        }
    ]
};
