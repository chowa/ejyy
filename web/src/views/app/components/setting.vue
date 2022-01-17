<template>
    <Drawer v-model="visible" class="cw-layout-setting" transfer>
        <Divider>主题风格设置</Divider>
        <div class="cw-layout-setting-item">
            <div
                :class="['cw-layout-setting-item-raido', settings.siderTheme === 'dark' ? 'selected' : '']"
                @click="setDarkSiderTheme"
            >
                <Tooltip content="暗色侧边栏" placement="top" transfer>
                    <img src="../../../assets/sider-theme-dark.svg" />
                </Tooltip>
            </div>

            <div
                :class="['cw-layout-setting-item-raido', settings.siderTheme === 'light' ? 'selected' : '']"
                @click="setLightSiderTheme"
            >
                <Tooltip content="亮色侧边栏" placement="top" transfer>
                    <img src="../../../assets/sider-theme-light.svg" />
                </Tooltip>
            </div>
        </div>

        <div class="cw-layout-setting-item">
            <div
                :class="['cw-layout-setting-item-raido', settings.headerTheme === 'light' ? 'selected' : '']"
                @click="setLightHeaderTheme"
            >
                <Tooltip content="亮色顶栏" placement="top" transfer>
                    <img src="../../../assets/sider-theme-dark.svg" />
                </Tooltip>
            </div>

            <div
                :class="['cw-layout-setting-item-raido', settings.headerTheme === 'dark' ? 'selected' : '']"
                @click="setDarkHeaderTheme"
            >
                <Tooltip content="暗色顶栏" placement="top" transfer>
                    <img src="../../../assets/header-theme-dark.svg" />
                </Tooltip>
            </div>

            <div
                :class="['cw-layout-setting-item-raido', settings.headerTheme === 'primary' ? 'selected' : '']"
                @click="setPrimaryHeaderTheme"
            >
                <Tooltip content="主色顶栏" placement="top" transfer>
                    <img src="../../../assets/header-theme-primary.svg" />
                </Tooltip>
            </div>
        </div>

        <Divider>导航设置</Divider>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                固定侧边栏
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.siderFixed" @on-change="this.updateSiderFixed" />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                固定顶栏
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.headerFixed" @on-change="this.updateHeaderFixed" />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                侧边栏开启手风琴模式
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.siderAccordion" @on-change="this.updateSiderAccordion" />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                显示全局面包屑导航
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.showBreadcurmd" @on-change="this.updateShowBreadcurmd" />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                显示面包屑导航图标
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.showBreadcurmdIcon" @on-change="this.updateShowBreadcurmdIcon" />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                显示全局刷新按钮
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.showRefresh" @on-change="this.updateShowRefresh" />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                侧栏折叠时显示父级菜单名
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch
                    size="small"
                    :value="settings.collapsedShowParentMenu"
                    @on-change="this.updateCollapsedShowParentMenu"
                />
            </span>
        </div>

        <div class="cw-layout-setting-item">
            <span class="cw-layout-setting-item-property">
                显示折叠侧栏按钮
            </span>
            <span class="cw-layout-setting-item-action">
                <CSwitch size="small" :value="settings.showSiderBtn" @on-change="this.updateShowSideBtn" />
            </span>
        </div>
    </Drawer>
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

import { Drawer, Divider, Switch, Tooltip } from 'view-design';
export default {
    name: 'Setting',
    props: {
        value: Boolean,
        settings: Object,
        updateSettings: Function
    },
    data() {
        return {
            visible: this.value
        };
    },
    methods: {
        setDarkSiderTheme() {
            this.updateSettings('siderTheme', 'dark');
        },
        setLightSiderTheme() {
            this.updateSettings('siderTheme', 'light');
        },
        setLightHeaderTheme() {
            this.updateSettings('headerTheme', 'light');
        },
        setDarkHeaderTheme() {
            this.updateSettings('headerTheme', 'dark');
        },
        setPrimaryHeaderTheme() {
            this.updateSettings('headerTheme', 'primary');
        },
        updateSiderFixed(e) {
            this.updateSettings('siderFixed', e);
        },
        updateHeaderFixed(e) {
            this.updateSettings('headerFixed', e);
        },
        updateSiderAccordion(e) {
            this.updateSettings('siderAccordion', e);
        },
        updateShowBreadcurmd(e) {
            this.updateSettings('showBreadcurmd', e);
            window.dispatchEvent(new Event('resize'));
        },
        updateShowBreadcurmdIcon(e) {
            this.updateSettings('showBreadcurmdIcon', e);
            window.dispatchEvent(new Event('resize'));
        },
        updateShowRefresh(e) {
            this.updateSettings('showRefresh', e);
        },
        updateCollapsedShowParentMenu(e) {
            this.updateSettings('collapsedShowParentMenu', e);
        },
        updateShowSideBtn(e) {
            this.updateSettings('showSiderBtn', e);
        },
        updateShowFooter(e) {
            this.updateSettings('showFooter', e);
        }
    },
    components: {
        Drawer,
        Divider,
        CSwitch: Switch,
        Tooltip
    },
    watch: {
        value(cur) {
            this.visible = cur;
        },
        visible(cur) {
            this.$emit('input', cur);
        }
    }
};
</script>

<style lang="less">
.cw-layout-setting {
    width: 280px;

    .ivu-drawer-close {
        line-height: 1;
    }

    .ivu-divider-inner-text {
        font-size: 14px;
    }

    &-item {
        display: flex;
        align-items: center;
        padding: 12px 0;

        &-raido {
            display: inline-block;
            position: relative;
            margin-right: 16px;
            cursor: pointer;

            &::after {
                content: '';
                display: block;
                width: 6px;
                height: 6px;
                border-radius: 6px;
                background: transparent;
                margin: 0 auto;
            }

            &.selected::after {
                background: #19be6b;
            }
        }

        &-property {
            font-size: 14px;
            flex: auto;
        }

        &-action {
            flex: none;
        }
    }
}
</style>
