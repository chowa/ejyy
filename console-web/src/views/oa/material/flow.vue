<template>
    <WaterMark>
        <Header>
            <Tabs :value="activeTab" slot="nav" @on-click="onTabChange">
                <TabPane label="我发起的流程" icon="md-people" name="my" />
                <TabPane label="需要我审批的" icon="approver" name="approver" />
                <TabPane label="抄送给我的" icon="ios-paper-plane-outline" name="notice" />
            </Tabs>
        </Header>

        <component :is="activeTab" />
    </WaterMark>
</template>

<script>
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

import { Header, WaterMark } from '@/components';
import { Tabs, TabPane } from 'view-design';
import My from './components/my';
import Approver from './components/approver';
import Notice from './components/notice';

export default {
    name: 'OaPurchaseFlow',
    data() {
        return {
            activeTab: this.$route.query.tab ? this.$route.query.tab : 'my'
        };
    },
    methods: {
        onTabChange(name) {
            this.activeTab = name;
            this.$router.push(`${this.$route.path}?tab=${name}`);
        }
    },
    components: {
        Tabs,
        TabPane,
        Header,
        WaterMark,
        My,
        Approver,
        Notice
    }
};
</script>
