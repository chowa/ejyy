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
    path: 'login',
    meta: {
        authRequired: false,
        title: '授权',
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./'),
    children: [
        {
            path: '',
            meta: {
                authRequired: false,
                title: '登录',
                layout: null,
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./main')
        },
        {
            path: 'wechat',
            meta: {
                authRequired: false,
                title: '校验',
                layout: null,
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./wechat')
        }
    ]
};
