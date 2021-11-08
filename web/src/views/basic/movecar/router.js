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
    path: 'movecar',
    meta: {
        title: '小区挪车',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'movecar',
        roles: [ROLES.XQNC]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '挪车请求',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XQNC]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '挪车详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.XQNC]
            },
            component: () => import('./detail')
        }
    ]
};
