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
    path: '/iot',
    meta: {
        title: '智慧物联',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'iot',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        require('./dashboard/router'),
        require('./entrance/router'),
        require('./elevator/router'),
        require('./lamp/router'),
        require('./energy/router'),
        require('./park/router'),
        require('./warning/router')
        // require('./monitor/router'),
        // require('./charging/router')
    ]
};
