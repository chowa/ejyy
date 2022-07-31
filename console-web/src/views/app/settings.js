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

const SIDER_MENU_COLLAPSED = 'SIDER_MENU_COLLAPSED';

const SETTING_SIDER_THEME = 'SETTING_SIDER_THEME';

const SETTING_HEADER_THEME = 'SETTING_HEADER_THEME';

const SETTING_SLIDER_FIXED = 'SETTING_SLIDER_FIXED';

const SETTING_HEADER_FIXED = 'SETTING_HEADER_FIXED';

const SETTING_HEADER_SHOW_BREADCRUB = 'SETTING_HEADER_SHOW_BREADCRUB';

const SETTING_HEADER_SHOW_BREADCRUD_ICON = 'SETTING_HEADER_SHOW_BREADCRUD_ICON';

const SETTING_HEADER_SHOW_REFRESH = 'SETTING_HEADER_SHOW_REFRESH';

const SETTING_SIDER_MENU_COLLAPSED_SHOW_PARENT_MENU = 'SETTING_SIDER_MENU_COLLAPSED_SHOW_PARENT_MENU';

const SETTING_SIDER_ACCORDION = 'SETTING_SIDER_ACCORDION';

const SETTING_SHOW_SIDE_BUTTON = 'SETTING_SHOW_SIDE_BUTTON';

function get(key, opts) {
    let val = window.localStorage.getItem(key);

    if (typeof opts[0] === 'boolean') {
        if (val === 'false') {
            val = false;
        } else if (val === 'true') {
            val = true;
        }
    }

    if (opts.includes(val)) {
        return val;
    }

    return opts[0];
}

const settings = {};

const relation = [
    {
        storageName: SIDER_MENU_COLLAPSED,
        vmName: 'siderCollapsed',
        values: [false, true]
    },
    {
        storageName: SETTING_SIDER_THEME,
        vmName: 'siderTheme',
        values: ['light', 'dark']
    },
    {
        storageName: SETTING_HEADER_THEME,
        vmName: 'headerTheme',
        values: ['light', 'primary', 'dark']
    },
    {
        storageName: SETTING_SLIDER_FIXED,
        vmName: 'siderFixed',
        values: [true, false]
    },
    {
        storageName: SETTING_HEADER_FIXED,
        vmName: 'headerFixed',
        values: [true, false]
    },
    {
        storageName: SETTING_SIDER_ACCORDION,
        vmName: 'siderAccordion',
        values: [true, false]
    },
    {
        storageName: SETTING_HEADER_SHOW_BREADCRUB,
        vmName: 'showBreadcurmd',
        values: [false, true]
    },
    {
        storageName: SETTING_HEADER_SHOW_BREADCRUD_ICON,
        vmName: 'showBreadcurmdIcon',
        values: [true, false]
    },
    {
        storageName: SETTING_HEADER_SHOW_REFRESH,
        vmName: 'showRefresh',
        values: [true, false]
    },
    {
        storageName: SETTING_SIDER_MENU_COLLAPSED_SHOW_PARENT_MENU,
        vmName: 'collapsedShowParentMenu',
        values: [true, false]
    },
    {
        storageName: SETTING_SHOW_SIDE_BUTTON,
        vmName: 'showSiderBtn',
        values: [true, false]
    }
];

relation.forEach(({ storageName, vmName, values }) => {
    settings[vmName] = get(storageName, values);
});

export function save(key, val) {
    const index = relation.findIndex(({ vmName }) => vmName === key);

    if (index === -1) {
        throw new Error(`unkonw setting ${key}`);
    }

    const { storageName, values } = relation[index];

    if (!values.includes(val)) {
        throw new Error(`illegal ${val} of setting ${key}`);
    }

    window.localStorage.setItem(storageName, val);
}

export default settings;
