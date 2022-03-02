/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'elevator',
    meta: {
        title: '智能梯控',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'elevator',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '通行记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'manage',
            meta: {
                title: '梯控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZNTK]
            },
            component: () => import('./manage')
        }
    ]
};
