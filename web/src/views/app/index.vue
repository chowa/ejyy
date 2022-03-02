<template>
    <section id="app">
        <audio ref="audio" preload="auto" hidden>
            <source src="../../assets/notice.mp3" type="audio/mpeg" />
        </audio>
        <Layout v-if="layout === 'sider'" class="cw-layout">
            <Sider
                :width="216"
                v-model="settings.siderCollapsed"
                :class="siderClasses"
                hide-trigger
                collapsible
                v-show="mediaQuery !== 'xs'"
                :collapsed-width="80"
            >
                <Nav
                    :siderCollapsed="settings.siderCollapsed"
                    :theme="settings.siderTheme"
                    :settings="settings"
                    :userInfo="userInfo"
                />
            </Sider>

            <Layout :class="contentLayoutClasses">
                <Header :class="headerClasses">
                    <Topbar
                        :siderCollapsed="settings.siderCollapsed"
                        :theme="settings.headerTheme"
                        :settings="settings"
                        :mediaQuery="mediaQuery"
                        :updateSettings="this.updateSettings"
                        :mobileMenuVisible="mobileMenuVisible"
                        :updateMobileMenuVisible="this.updateMobileMenuVisible"
                        :userInfo="userInfo"
                        :postInfo="postInfo"
                        v-model="settingVisible"
                    />
                </Header>

                <Content :class="contentClasses">
                    <router-view />
                </Content>

                <Footer>
                    <Copyright />
                </Footer>
            </Layout>

            <!-- mobile menu -->
            <Drawer
                :closable="false"
                v-model="mobileMenuVisible"
                v-show="mediaQuery === 'xs'"
                placement="left"
                transfer
                :class="mobileMenuClasses"
            >
                <Nav :siderCollapsed="false" :theme="settings.siderTheme" :settings="settings" :userInfo="userInfo" />
            </Drawer>

            <Setting v-model="settingVisible" :settings="settings" :updateSettings="this.updateSettings" />
        </Layout>
        <router-view v-else />
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

import { mapActions, mapGetters } from 'vuex';
import { Layout, Sider, Header, Content, Drawer, Notice, Modal } from 'view-design';
import Nav from './components/nav';
import Topbar from './components/topbar';
import Setting from './components/setting';
import Copyright from './components/copyright';
import settings, { save as saveSettings } from './settings';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'ChowaApp',
    data() {
        return {
            settingVisible: false,
            mobileMenuVisible: false,
            mediaQuery: this.computedMediaQuery(),
            settings,
            socketConnected: false
        };
    },
    mounted() {
        window.addEventListener('resize', this.onResize, false);
    },
    destroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        ...mapActions({
            fetchUserInfo: 'common/fetchUserInfo',
            pushUnreadNotices: 'common/pushUnreadNotices'
        }),
        computedMediaQuery() {
            const { innerWidth: width } = window;

            if (width >= 1600) {
                return 'xxl';
            } else if (width >= 1200 && width < 1600) {
                return 'xl';
            } else if (width >= 992 && width < 1200) {
                return 'lg';
            } else if (width >= 768 && width < 992) {
                return 'md';
            } else if (width >= 576 && width < 768) {
                return 'sm';
            } else {
                return 'xs';
            }
        },
        onResize() {
            this.mediaQuery = this.computedMediaQuery();
        },
        updateSettings(key, val) {
            saveSettings(key, val);
            this.settings[key] = val;
        },
        updateMobileMenuVisible() {
            this.mobileMenuVisible = !this.mobileMenuVisible;
        },
        connect() {
            const ws = new WebSocket(
                `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/cws?token=${utils.auth.getToken()}`
            );
            let timer = null;
            const heartCheck = () => {
                timer = setTimeout(() => {
                    ws.send('ping');
                    heartCheck();
                }, 30000);
            };
            const showDisconnectModal = () => {
                clearTimeout(timer);
                Modal.confirm({
                    title: '网络异常',
                    content: '网络异常，请点击「确定」重新加载网络',
                    onOk: () => window.location.reload(),
                    onCancel: () => {}
                });
            };

            ws.onopen = () => {
                heartCheck();
            };

            ws.onmessage = e => {
                const { type, id, community_id, urge } = JSON.parse(e.data);

                if (this.postInfo.default_community_id !== community_id) {
                    return;
                }

                let title = null;
                let desc = null;
                let route = null;
                const uuid = `${Date.now()}${id}${type}`;

                switch (type) {
                    case ROLES.WXWF:
                        title = urge ? '工单催促' : '维修维护';
                        desc = urge ? '业主催促工单进度了，请尽快处理' : '业主提交了新的工单，请尽快响应';
                        route = 'repair';
                        break;

                    case ROLES.TSJY:
                        title = '投诉建议';
                        desc = '业主提交了投诉建议，请尽快回复';
                        route = 'complain';
                        break;

                    case ROLES.ZXDJ:
                        title = '装修登记';
                        desc = '业主提交了装修登记，请尽快处理';
                        route = 'fitment';
                        break;

                    case ROLES.XQNC:
                        title = '小区挪车';
                        desc = '业主的车被堵住了，快协助车主联系一下吧';
                        route = 'movecar';
                        break;
                }

                try {
                    this.$refs.audio.play();
                } catch (e) {
                    //
                }

                Notice.info({
                    duration: 0,
                    title,
                    name: uuid,
                    render: h =>
                        h(
                            'a',
                            {
                                on: {
                                    click: () => {
                                        this.$router.push(`/basic/${route}/detail/${id}`);
                                        Notice.close(uuid);
                                    }
                                }
                            },
                            desc
                        )
                });

                clearTimeout(timer);
                heartCheck();
            };

            ws.onclose = e => {
                if (e.code !== 1000 && e.code !== 1005) {
                    showDisconnectModal();
                }
            };

            ws.onerror = () => {
                showDisconnectModal();
            };

            window.onbeforeunload = () => {
                ws.close();
            };
        }
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo',
            postInfo: 'common/postInfo'
        }),
        layout() {
            return this.$route.meta.layout;
        },
        siderClasses() {
            const { siderTheme, siderFixed } = this.settings;

            return {
                'cw-layout-sider': true,
                [`cw-layout-sider-${siderTheme}`]: true,
                'cw-layout-sider-fixed': siderFixed
            };
        },
        headerClasses() {
            const { headerTheme, headerFixed, siderCollapsed } = this.settings;

            return {
                'cw-layout-header': true,
                'cw-layout-header-fixed': headerFixed,
                'cw-layout-header-fixed-collapsed': headerFixed && siderCollapsed,
                'cw-layout-header-fixed-mobile': headerFixed && this.mediaQuery === 'xs',
                [`cw-layout-header-${headerTheme}`]: true
            };
        },
        contentLayoutClasses() {
            const { siderFixed, siderCollapsed } = this.settings;

            return {
                'cw-layout-content-layout': siderFixed && this.mediaQuery !== 'xs',
                'cw-layout-content-layout-collapsed': siderFixed && siderCollapsed && this.mediaQuery !== 'xs'
            };
        },
        contentClasses() {
            const { headerFixed } = this.settings;

            return {
                'cw-layout-content': true,
                'cw-layout-content-fill': headerFixed
            };
        },
        mobileMenuClasses() {
            const { siderTheme } = this.settings;

            return {
                'cw-layout-mobile-menu': true,
                [`cw-layout-moible-menu-${siderTheme}`]: true
            };
        }
    },
    components: {
        Layout,
        Sider,
        Header,
        Content,
        Nav,
        Topbar,
        Drawer,
        Setting,
        Copyright
    },
    watch: {
        $route(cur, old) {
            if (this.mediaQuery === 'xs' && cur.path !== old.path) {
                this.mobileMenuVisible = false;
            }

            if (this.userInfo.id === undefined && cur.meta.authRequired) {
                this.fetchUserInfo();
            }

            if (this.userInfo.id && cur.meta.accessRequired && !this.postInfo.job && !this.postInfo.is_admin) {
                utils.auth.logout();
                this.$router.replace('/login');
            }
        },
        'userInfo.id'(cur) {
            if (!cur || !this.userInfo.access.length === 0 || this.socketConnected) {
                return;
            }

            this.socketConnected = true;
            this.connect();
        }
    }
};
</script>

<style lang="less">
#app,
body,
html,
.cw-layout {
    height: 100%;
}

.cw-layout {
    // sider
    &-sider {
        min-height: 100vh;
        z-index: 13;

        &-light {
            box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
        }

        &-dark {
            background: #191a23 !important;
            box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
        }

        &-fixed {
            position: fixed !important;
            top: 0;
            left: 0;
        }
    }

    // header
    &-header {
        transition: all 0.2s ease-in-out;
        z-index: 11;

        &-fixed {
            position: fixed;
            top: 0;
            right: 0;
            left: 216px;

            &-collapsed {
                left: 80px;
            }

            &-mobile {
                left: 0;
            }
        }

        &-light {
            box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        }

        &-dark {
            background: #191a23 !important;
        }

        &-primary {
            background: linear-gradient(90deg, #1d42ab, #2173dc, #1e93ff) !important;
        }
    }

    // content layout
    &-content-layout {
        transition: all 0.2s ease-in;
        padding-left: 216px;

        &-collapsed {
            padding-left: 80px;
        }
    }

    // 移动端菜单
    &-mobile-menu {
        width: 216px;

        .ivu-drawer-body {
            padding: 0;
        }

        &-light {
            .ivu-drawer-content {
                background: #fff;
            }
        }

        &-dark {
            .ivu-drawer-content {
                background: #191a23;
            }
        }
    }

    // 内容
    &-content {
        padding: 26px 26px 0;
        position: relative;

        &-fill {
            padding-top: 89px !important;
        }
    }
}

@media screen and (max-width: 586px) {
    .cw-layout {
        &-content {
            padding: 12px;
        }
    }
}
</style>
