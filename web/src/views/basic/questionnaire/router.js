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
    path: 'questionnaire',
    meta: {
        title: '问卷调查',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'question',
        roles: [ROLES.WJDC]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部问卷',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.WJDC]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '创建问卷',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.WJDC]
            },
            component: () => import('./create')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改问卷',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.WJDC]
            },
            component: () => import('./update')
        },
        {
            path: 'preview/:id',
            meta: {
                title: '问卷详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.WJDC]
            },
            component: () => import('./preview')
        }
    ]
};
