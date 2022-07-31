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
    path: 'init',
    meta: {
        title: '系统初始化',
        authRequired: false,
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '管理员扫码',
                authRequired: false,
                layout: null,
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./scan')
        },
        {
            path: 'fill',
            meta: {
                title: '初始化信息',
                authRequired: false,
                layout: null,
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./fill')
        }
    ]
};
