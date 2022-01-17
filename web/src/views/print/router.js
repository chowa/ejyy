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
    path: '/print',
    meta: {
        authRequired: true,
        title: '打印',
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./'),
    children: [
        {
            path: 'material',
            meta: {
                title: '物料二维码',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'qrcode',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./material')
        },
        {
            path: 'storehouse',
            meta: {
                title: '仓库二维码',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'qrcode',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./storehouse')
        },
        {
            path: 'mission',
            meta: {
                title: '巡检点二维码',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'qrcode',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./mission')
        },
        {
            path: 'meeting',
            meta: {
                title: '会议室二维码',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'qrcode',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./meeting')
        },
        {
            path: 'fee_notice',
            meta: {
                title: '物业缴费通知',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'article',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./fee_notice')
        },
        {
            path: 'fee_order',
            meta: {
                title: '物业费缴费凭证',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'order',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./fee_order')
        },
        {
            path: 'fee_urge',
            meta: {
                title: '物业缴费通知',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'article',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./fee_urge')
        },
        {
            path: 'meter',
            meta: {
                title: '仪表二维码',
                authRequired: true,
                layout: null,
                nav: false,
                print: 'qrcode',
                roles: [ROLES.ANYONE]
            },
            component: () => import('./meter')
        }
    ]
};
