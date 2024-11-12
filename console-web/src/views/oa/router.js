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
    path: '/oa',
    meta: {
        title: '协同办公',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'oa',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        require('./dashboard/router'),
        require('./party/router'),
        require('./inform/router'),
        require('./mission/router'),
        require('./order/router'),
        require('./meeting/router'),
        require('./finance/router'),
        require('./leave/router'),
        require('./refound/router'),
        require('./material/router'),
        require('./contract/router'),
        require('./hr/router')
    ]
};
