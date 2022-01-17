<template>
    <section :class="wrapperClasses">
        <div class="cw-layout-topbar-left">
            <router-link to="/" v-if="mediaQuery === 'xs'">
                <img src="../../../assets/logo.svg" class="cw-layout-topbar-logo" />
            </router-link>

            <button @click="updateCollapse">
                <template v-if="mediaQuery === 'xs'">
                    <Icon type="menu-fold" v-if="mobileMenuVisible" />
                    <Icon type="menu-unfold" v-else />
                </template>
                <template v-else>
                    <template v-if="settings.showSiderBtn">
                        <Icon type="menu-fold" v-if="!siderCollapsed" />
                        <Icon type="menu-unfold" v-else />
                    </template>
                </template>
            </button>

            <button v-if="settings.showRefresh && mediaQuery !== 'xs'" @click="refreshPage">
                <Icon type="refresh" />
            </button>

            <ul class="cw-layout-topbar-menu" ref="menu" v-show="showMenu">
                <template v-for="(item, key) in moduleRoutes">
                    <li
                        :key="key"
                        v-if="key < menuIndex && item.meta.nav && haveAccess(item.meta.roles)"
                        :class="module === item.path ? 'active' : ''"
                    >
                        <router-link :to="item.path">
                            <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                            {{ item.meta.title }}
                        </router-link>
                    </li>
                </template>
                <li v-if="moduleRoutes.length > menuIndex">
                    <Dropdown placement="bottom-start" transfer>
                        <Icon type="omit" />

                        <DropdownMenu slot="list" style="width: 140px">
                            <template v-for="(item, key) in moduleRoutes">
                                <DropdownItem :key="key" v-if="key >= menuIndex" :selected="module === item.path">
                                    <router-link :to="item.path">
                                        <Icon :type="item.meta.icon" v-if="item.meta.icon" />
                                        {{ item.meta.title }}
                                    </router-link>
                                </DropdownItem>
                            </template>
                        </DropdownMenu>
                    </Dropdown>
                </li>
            </ul>

            <Breadcrumb
                class="layout-breadcrumb"
                v-if="settings.showBreadcurmd && (mediaQuery === 'xxl' || mediaQuery === 'xl' || mediaQuery === 'lg')"
            >
                <BreadcrumbItem v-for="(item, index) in breadcrumbs" :key="index">
                    <Icon :type="item.icon" v-if="item.icon && settings.showBreadcurmdIcon" />
                    {{ item.title }}
                </BreadcrumbItem>
            </Breadcrumb>
        </div>

        <div class="cw-layout-topbar-right">
            <button @click="fullScreen" class="cw-layout-topbar-full-screen" v-if="mediaQuery !== 'xs'">
                <Icon :type="inFullScreen ? 'exit-full-screen' : 'full-screen'" />
            </button>

            <Dropdown placement="bottom-start" transfer>
                <button class="cw-layout-topbar-avatar">
                    <Icon type="address" />
                    {{ defaultCommunityName }}小区
                </button>
                <DropdownMenu slot="list">
                    <DropdownItem
                        v-for="item in postInfo.community_list"
                        :key="item.id"
                        @click.native="setDefaultCommunity(item.community_id)"
                        :selected="item.community_id === postInfo.default_community_id"
                    >
                        {{ item.name }}
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <Dropdown placement="bottom-start" transfer>
                <button class="cw-layout-topbar-avatar">
                    <Avatar
                        icon="ios-person"
                        size="small"
                        :src="userInfo.avatar_url ? ASSET_HOST + userInfo.avatar_url : null"
                    />
                    <span>{{ userInfo.real_name }}</span>
                </button>
                <DropdownMenu slot="list" class="cw-layout-topbar-user-drop">
                    <DropdownItem @click.native="goZone">
                        <Icon type="md-contact" />
                        个人中心
                    </DropdownItem>
                    <DropdownItem divided @click.native="logout">
                        <Icon type="ios-log-out" />
                        退出登录
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <button @click="showSetting">
                <Icon type="more" />
            </button>
        </div>
    </section>
</template>

<script>
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

import {
    Icon,
    Breadcrumb,
    BreadcrumbItem,
    Avatar,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Badge,
    Modal,
    Message
} from 'view-design';
import { mapActions } from 'vuex';
import * as utils from '@/utils';
import * as config from '@/config';
import ROLES from '@/constants/role';
import { routes } from '@/router';

export default {
    name: 'Topbar',
    props: {
        siderCollapsed: Boolean,
        mobileMenuVisible: Boolean,
        theme: String,
        settings: Object,
        mediaQuery: String,
        updateSettings: Function,
        updateMobileMenuVisible: Function,
        userInfo: Object,
        postInfo: Object,
        value: Boolean
    },
    data() {
        return {
            ASSET_HOST: config.ASSET_HOST,
            settingsVisible: true,
            inFullScreen: !!(
                document.fullscreen ||
                document.mozFullScreen ||
                document.webkitIsFullScreen ||
                document.webkitFullScreen ||
                document.msFullScreen
            ),
            showMenu: false,
            menuIndex: 0
        };
    },
    mounted() {
        this.onResize();

        window.addEventListener('resize', this.onResize, false);
        document.addEventListener('fullscreenchange', this.onFullScreenChange, false);
        document.addEventListener('mozfullscreenchange', this.onFullScreenChange, false);
        document.addEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
        document.addEventListener('msfullscreenchange', this.onFullScreenChange, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('fullscreenchange', this.onFullScreenChange);
        document.removeEventListener('mozfullscreenchange', this.onFullScreenChange);
        document.removeEventListener('webkitfullscreenchange', this.onFullScreenChange);
        document.removeEventListener('msfullscreenchange', this.onFullScreenChange);
    },
    methods: {
        ...mapActions({
            updateUserInfo: 'common/updateUserInfo'
        }),
        onResize() {
            this.showMenu = false;

            this.$nextTick(() => {
                const $menu = this.$refs.menu;
                const $wrapper = $menu.parentNode;
                let width = $wrapper.getBoundingClientRect().width;

                for (let i = 0; i < $wrapper.children.length; i++) {
                    const $item = $wrapper.children[i];

                    if (!$item.isEqualNode($menu)) {
                        width -= $item.getBoundingClientRect().width;
                    }
                }

                this.menuIndex = Math.floor(width / 110);
                this.showMenu = true;
            });
        },
        onFullScreenChange() {
            this.inFullScreen = !!(
                document.fullscreen ||
                document.mozFullScreen ||
                document.webkitIsFullScreen ||
                document.webkitFullScreen ||
                document.msFullScreen
            );
        },
        updateCollapse() {
            if (this.mediaQuery === 'xs') {
                this.updateMobileMenuVisible();
            } else {
                this.updateSettings('siderCollapsed', !this.siderCollapsed);
            }
        },
        haveAccess(roles) {
            return (
                !!this.userInfo.admin ||
                roles.includes(ROLES.ANYONE) ||
                roles.some(role => this.userInfo.access.includes(role))
            );
        },
        refreshPage() {
            Modal.confirm({
                title: '页面重载确认',
                content: '您确定重新载入页面吗？您的操作记录及输入内容将会丢失。',
                onOk: () => {
                    window.location.reload();
                }
            });
        },
        showSetting() {
            this.$emit('input', !this.value);
        },
        fullScreen() {
            if (this.inFullScreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                const el = document.documentElement;
                const rfs =
                    el.requestFullScreen ||
                    el.webkitRequestFullScreen ||
                    el.mozRequestFullScreen ||
                    el.msRequestFullScreen;

                rfs.call(el);
            }
        },
        logout() {
            Modal.confirm({
                title: '退出登录确认',
                content: '您确定退出登录当前账户吗？个人设置将会保存。',
                onOk: () => {
                    utils.request
                        .get('/user/logout')
                        .then(() => {
                            utils.auth.logout();
                            this.$router.replace({
                                path: '/user/login',
                                query: { redirect: this.$router.currentRoute.fullPath }
                            });
                        })
                        .catch(() => Message.error('退出登录失败，请重试'));
                }
            });
        },
        setDefaultCommunity(id) {
            if (this.postInfo.default_community_id === id) return;
            const index = this.postInfo.community_list.findIndex(item => item.community_id === id);

            Modal.confirm({
                title: '请确认',
                content: `确认要切换到「${this.postInfo.community_list[index].name}」小区吗？`,
                onOk: () => {
                    utils.request
                        .post('/community/default', { community_id: id })
                        .then(() => {
                            this.updateUserInfo({
                                userInfo: this.userInfo,
                                postInfo: {
                                    ...this.postInfo,
                                    default_community_id: id
                                }
                            });
                            Message.success('切换默认小区成功');
                        })
                        .catch(() => {});
                }
            });
        },
        goZone() {
            this.$router.push('/user/zone');
        }
    },
    computed: {
        wrapperClasses() {
            return {
                'cw-layout-topbar': true,
                [`cw-layout-topbar-${this.theme}`]: true
            };
        },
        breadcrumbs() {
            const ret = [
                {
                    icon: 'home',
                    title: config.SITE_TITLE
                }
            ];

            this.$route.matched.forEach(item => {
                ret.push({
                    title: item.meta.title,
                    icon: item.meta.icon
                });
            });

            return ret;
        },
        module() {
            return this.$route.matched[0].path;
        },
        moduleRoutes() {
            return routes.filter(item => {
                return item.meta.nav && this.haveAccess(item.meta.roles);
            });
        },
        defaultCommunityName() {
            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            if (index < 0) {
                return '……';
            }

            return this.postInfo.community_list[index].name;
        }
    },
    components: {
        Icon,
        Breadcrumb,
        BreadcrumbItem,
        Avatar,
        Dropdown,
        DropdownMenu,
        DropdownItem,
        Badge
    }
};
</script>

<style lang="less">
.cw-layout-topbar {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    flex-wrap: nowrap;
    overflow: hidden;

    &-right,
    &-left {
        display: flex;
        height: 100%;
        align-items: center;
        white-space: nowrap;
    }

    &-left {
        flex: auto;
        padding-right: 12px;

        a {
            flex: none;
        }
    }

    &-right {
        flex: none;
    }

    &-logo {
        width: 40px;
        vertical-align: middle;
        margin: 0 6px 0 6px;
    }

    &-menu {
        flex: none;
        list-style: none;
        height: 64px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        flex-wrap: nowrap;

        li {
            height: 64px;
            line-height: 64px;
            font-size: 14px;
            position: relative;
            padding: 0 14px;
            text-align: center;
            cursor: pointer;
            flex: none;
            transition: 0.2s ease-in-out;

            &::after {
                content: '';
                position: absolute;
                left: 50%;
                right: 50%;
                bottom: 0;
                height: 2px;
                background: transparent;
                transition: 0.2s ease-in-out;
            }

            a {
                display: block;
                transition: 0.2s ease-in-out;
            }

            &.active {
                &::after {
                    left: 0;
                    right: 0;
                }
            }
        }
    }

    &-notice {
        .ivu-badge {
            line-height: 1;
        }

        .ivu-icon {
            font-size: 18px;
        }
    }

    &-notice-drop {
        max-width: 300px;
        width: 300px !important;
        height: 420px;
        max-height: 420px !important;
        overflow: hidden !important;

        h3 {
            font-weight: 400;
            font-size: 14px;
            text-align: center;
            line-height: 32px;
            border-bottom: 1px solid #e8eaec;
        }

        .notice-content {
            height: 348px;
            overflow-x: hidden;
            overflow-y: auto;

            h5 {
                line-height: 380px;
                color: #999;
                text-align: center;
            }
        }

        &-read {
            text-align: center;
            border-top: 1px solid #e8eaec;
            color: #515a6e;
            transition: all 0.2s ease-in;
            line-height: 31px;
            font-size: 14px;
            cursor: pointer;

            i {
                margin-right: 6px;
            }

            &:hover:not(.disabled) {
                color: #57a3f3;
            }

            &.disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
        }
    }

    &-notice-item {
        padding: 12px 24px;
        border-bottom: 1px solid #e8eaec;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        text-align: left;
        display: flex;
        flex-direction: row;
        overflow: hidden;

        .icon {
            width: 32px;
            height: 32px;
            flex: none;
            background-color: rgb(255, 153, 0);
            border-radius: 50%;
            line-height: 32px;
            font-size: 12px;
            color: #fff;
            text-align: center;
            margin-right: 12px;
            text-transform: lowercase;
        }

        &-content {
            overflow: hidden;

            h4 {
                font-size: 14px;
                font-weight: 400;
                line-height: 22px;
                color: #515a6e;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            p {
                font-size: 12px;
                color: #808695;
            }
        }

        &:hover {
            background: #f0faff;
        }

        &:last-child {
            border-bottom: none;
        }
    }

    &-avatar {
        font-size: 12px;

        .ivu-avatar {
            margin-right: 8px;
        }
    }

    &-user-drop {
        i {
            font-size: 16px;
            margin-right: 6px;
            vertical-align: middle;
            margin-top: -2px;
        }
    }

    &-full-screen {
        font-size: 18px;
    }

    button {
        border: none;
        background: none;
        padding: 0 12px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        outline: none;
    }

    .ivu-breadcrumb {
        margin-left: 12px;
        display: inline-block;

        > span:last-child {
            font-weight: 400 !important;
        }

        .ivu-icon {
            margin-right: 6px;
        }
    }

    &-light {
        button {
            color: #515a6e;

            &:hover {
                background: #f8f8f9;
            }
        }

        .cw-layout-topbar-menu li {
            color: #2b2b2b;

            a {
                display: block;
                color: #2b2b2b;
                transition: 0.2s ease-in-out;
            }

            &.active,
            &:hover {
                color: #2d8cf0;

                a {
                    color: #2d8cf0;
                }

                &::after {
                    left: 0;
                    right: 0;
                    background: #2d8cf0;
                }
            }
        }
    }

    &-dark,
    &-primary {
        button {
            color: #fff;

            &:hover {
                background: hsla(0, 0%, 100%, 0.05);
            }
        }

        .ivu-breadcrumb {
            > span:last-child .ivu-breadcrumb-item-link {
                color: #fff;
            }

            .ivu-breadcrumb-item-link {
                color: hsla(0, 0%, 100%, 0.7);
            }
        }

        .cw-layout-topbar-menu li {
            color: #ddd;

            a {
                display: block;
                color: #ddd;
                transition: 0.2s ease-in-out;
            }

            &.active,
            &:hover {
                color: #fff;

                a {
                    color: #fff;
                }

                &::after {
                    left: 0;
                    right: 0;
                    background: #2d8cf0;
                }
            }
        }
    }
}

@media screen and (max-width: 586px) {
    .cw-layout-topbar {
        &-full-screen {
            display: none;
        }
    }
}
</style>
