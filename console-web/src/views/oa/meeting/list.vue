<template>
    <WaterMark>
        <Header>
            <Tabs :value="activeTab" slot="nav" @on-click="onTabChange">
                <TabPane label="我发起的会议" icon="meeting-create" name="my" />
                <TabPane label="需要我参与的会议" icon="meeting-participant" name="participant" />
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
import Participant from './components/participant';

export default {
    name: 'OaMeetingList',
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
        Participant
    }
};
</script>
