<template>
    <section :class="wrapperClasses">
        <div class="cw-layout-nav-inner-logo">
            <router-link to="/">
                <img src="../../../assets/logo.svg" class="logo-img" />
                <span v-show="!siderCollapsed">
                    <img src="../../../assets/logo_txt_white.svg" v-if="theme === 'dark'" class="logo-txt" />
                    <img src="../../../assets/logo_txt.svg" v-else class="logo-txt" />
                </span>
            </router-link>
        </div>

        <Menu
            :active-name="actievMenu"
            :open-names="openSubmenu"
            width="auto"
            :accordion="settings.siderAccordion"
            class="cw-layout-nav-inner-menu"
            ref="siderMenu"
            :theme="theme"
        >
            <template v-for="(item, key) in routes">
                <template v-if="item.meta && item.meta.nav">
                    <template v-if="siderCollapsed">
                        <template v-if="!haveSubMenu(item.children)">
                            <Tooltip
                                :content="item.meta.title"
                                placement="right"
                                :key="key"
                                transfer
                                v-if="haveAccess(item.meta.roles)"
                            >
                                <MenuItem
                                    :name="url(item)"
                                    :to="url(item)"
                                    :class="[
                                        'cw-layout-nav-inner-menu-collapsed-item',
                                        openSubmenu.includes(item.path)
                                            ? 'cw-layout-nav-inner-menu-collapsed-item-active'
                                            : ''
                                    ]"
                                >
                                    <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                                    <template v-else>
                                        {{ item.meta.title }}
                                    </template>
                                </MenuItem>
                            </Tooltip>
                        </template>
                        <template v-else>
                            <Dropdown
                                placement="right-start"
                                :key="key"
                                transfer
                                :transfer-class-name="submenuClasses"
                                v-if="haveAccess(item.meta.roles)"
                            >
                                <MenuItem
                                    :name="url(item)"
                                    :to="url(item)"
                                    :class="[
                                        'cw-layout-nav-inner-menu-collapsed-item',
                                        openSubmenu.includes(item.path)
                                            ? 'cw-layout-nav-inner-menu-collapsed-item-active'
                                            : ''
                                    ]"
                                >
                                    <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                                    <template v-else>
                                        {{ item.meta.title }}
                                    </template>
                                </MenuItem>

                                <DropdownMenu slot="list">
                                    <div
                                        class="cw-layout-nav-inner-collapsed-submenu-title"
                                        v-if="settings.collapsedShowParentMenu"
                                    >
                                        <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                                        {{ item.meta.title }}
                                    </div>
                                    <template v-for="(row, index) in item.children">
                                        <router-link
                                            :to="url(item, row)"
                                            :key="index"
                                            v-if="haveAccess(row.meta.roles) && row.meta.nav"
                                        >
                                            <DropdownItem
                                                :selected="
                                                    actievMenu === url(item, row) ||
                                                        (actievMenu === item.path && row.path === '')
                                                "
                                            >
                                                {{ row.meta.title }}
                                            </DropdownItem>
                                        </router-link>
                                    </template>
                                </DropdownMenu>
                            </Dropdown>
                        </template>
                    </template>
                    <template v-else>
                        <template v-if="!haveSubMenu(item.children)">
                            <MenuItem :name="url(item)" :to="url(item)" :key="key" v-if="haveAccess(item.meta.roles)">
                                <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                                {{ item.meta.title }}
                            </MenuItem>
                        </template>
                        <template v-else>
                            <Submenu
                                :name="url(item)"
                                :key="key"
                                :html-name="item.path"
                                v-if="haveAccess(item.meta.roles)"
                            >
                                <template slot="title">
                                    <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                                    {{ item.meta.title }}
                                </template>

                                <template v-for="(row, index) in item.children">
                                    <MenuItem
                                        :name="url(item, row)"
                                        :to="url(item, row)"
                                        :key="index"
                                        v-if="haveAccess(row.meta.roles) && row.meta.nav"
                                    >
                                        {{ row.meta.title }}
                                    </MenuItem>
                                </template>
                            </Submenu>
                        </template>
                    </template>
                </template>
            </template>
        </Menu>
    </section>
</template>

<script>
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

import { Menu, MenuItem, Submenu, Icon, Dropdown, DropdownItem, DropdownMenu, Tooltip } from 'view-design';
import { routes } from '@/router';
import { SITE_TITLE } from '@/config';
import ROLES from '@/constants/role';

export default {
    name: 'Nav',
    props: {
        siderCollapsed: Boolean,
        theme: String,
        settings: Object,
        userInfo: Object
    },
    data() {
        return {
            SITE_TITLE
        };
    },
    mounted() {
        setTimeout(() => {
            this.updateNavStatus();
        }, 1000);
    },
    methods: {
        url(self, child) {
            const ret = [this.module];

            if (self.path !== '') {
                ret.push(self.path.replace(/\//g, ''));
            }

            if (child && child.path !== '') {
                ret.push(child.path.replace(/\//g, ''));
            }

            return ret.join('/');
        },
        updateNavStatus() {
            this.$nextTick(() => {
                if (this.$refs.siderMenu) {
                    this.$refs.siderMenu.updateOpened();
                    this.$refs.siderMenu.updateActiveName(this.actievMenu);
                }
            });
        },
        haveSubMenu(routes) {
            return Array.isArray(routes) && routes.some(route => route.meta && route.meta.nav);
        },
        haveAccess(roles) {
            return (
                !!this.userInfo.admin ||
                roles.includes(ROLES.ANYONE) ||
                roles.some(role => this.userInfo.access.includes(role))
            );
        }
    },
    computed: {
        actievMenu() {
            return this.$route.path;
        },
        openSubmenu() {
            const ret = [];

            this.$route.matched.forEach(({ path }) => {
                ret.push(path);
            });

            return ret;
        },
        wrapperClasses() {
            return {
                'cw-layout-nav-inner': true,
                [`cw-layout-nav-inner-${this.theme}`]: true
            };
        },
        submenuClasses() {
            return [
                'cw-layout-nav-inner-collapsed-submenu',
                `cw-layout-nav-inner-collapsed-submenu-${this.theme}`
            ].join(' ');
        },
        module() {
            return this.$route.matched[0].path;
        },
        routes() {
            for (let i = 0; i < routes.length; i++) {
                if (routes[i].path === this.module) {
                    return routes[i].children;
                }
            }

            return [];
        }
    },
    watch: {
        siderCollapsed(cur) {
            if (!cur) {
                this.updateNavStatus();
            }
        },
        $route() {
            this.updateNavStatus();
        }
    },
    components: {
        Menu,
        MenuItem,
        Submenu,
        Icon,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        Tooltip
    }
};
</script>

<style lang="less">
.cw-layout-nav-inner {
    overflow: hidden;

    &-logo {
        height: 64px;
        line-height: 63px;
        overflow: hidden;
        text-align: center;
        white-space: nowrap;

        img {
            display: inline-block;
            vertical-align: middle;
        }
        .logo-img {
            width: 38px;
        }

        .logo-txt {
            margin-left: 18px;
            height: 22px;
        }
    }

    &-menu {
        height: calc(~'100vh - 64px');
        overflow-y: auto;
    }

    @keyframes menuTransfer {
        0% {
            width: 256px;
        }

        100% {
            width: 52px;
        }
    }

    &-menu-collapsed-item {
        height: 52px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 80px;
        text-align: center;
        animation: menuTransfer 0.2s ease-in;

        i {
            margin-right: 0 !important;
        }
    }

    &-collapsed-submenu {
        min-width: 160px !important;
        margin-left: 3px !important;

        &-title {
            text-align: center;
            course: default;
            padding: 6px 0;

            i {
                margin-right: 8px;
                vertical-align: middle;
                margin-top: -2px;
            }
        }

        .ivu-dropdown-item {
            transition: all 0.2s ease-in-out;
        }

        &-dark {
            background-color: #191a23 !important;

            .cw-layout-nav-inner-collapsed-submenu {
                &-title {
                    color: hsla(0, 0%, 100%, 0.7);
                    border-bottom: 1px solid #101117;
                }
            }

            .ivu-dropdown-item {
                color: hsla(0, 0%, 100%, 0.7);
                transition: all 0.2s ease-in-out;
            }

            .ivu-dropdown-item:hover {
                background: none;
                color: #fff;
            }

            .ivu-dropdown-item-selected,
            .ivu-dropdown-item-selected:hover {
                background: #2d8cf0 !important;
                color: #fff !important;
            }
        }

        &-light {
            .cw-layout-nav-inner-collapsed-submenu {
                &-title {
                    border-bottom: 1px solid #f8f8f9;
                }
            }
        }
    }

    &-dark {
        .cw-layout-nav-inner {
            &-logo {
                border-bottom: 1px solid #101117;
                background: #191a23;

                a {
                    color: #fff;
                }
            }

            &-menu {
                .ivu-menu-item-active:not(.ivu-menu-submenu),
                .ivu-menu-item-active:not(.ivu-menu-submenu):hover {
                    background: #2d8cf0;
                    color: #fff !important;
                }

                .ivu-menu-submenu-title {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            &-menu-collapsed-item {
                &-active {
                    background: #101117;
                }
            }
        }
    }

    &-light {
        .cw-layout-nav-inner {
            &-logo {
                border-bottom: 1px solid #f8f8f9;

                a {
                    color: #2b2b2b;
                }
            }

            &-menu {
                &:after {
                    display: none !important;
                }
            }

            &-menu-collapsed-item {
                &-active {
                    color: #2d8cf0;
                    background: #f0faff;

                    &::after {
                        content: '';
                        display: block;
                        width: 2px;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        right: 0;
                        background: #2d8cf0;
                    }
                }
            }
        }
    }

    .ivu-tooltip,
    .ivu-tooltip-rel {
        display: block;
    }

    .ivu-menu-submenu-title > i,
    .ivu-menu-item > i {
        font-size: 16px;
    }
}
</style>
