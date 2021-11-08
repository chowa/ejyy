<template>
    <WaterMark>
        <Header>
            <Tabs :value="activeTab" slot="nav" @on-click="onTabChange">
                <TabPane label="我需要完成的任务" icon="my-mission" name="my" />
                <TabPane label="我分配给别人的任务" icon="dispose-mission" name="dispose" />
                <TabPane
                    label="全部巡检任务"
                    icon="all-mission"
                    name="all"
                    v-if="userInfo.access.includes(ROLES.XJRW)"
                />
            </Tabs>
        </Header>

        <component :is="activeTab" />
    </WaterMark>
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

import { mapGetters } from 'vuex';
import { Header, WaterMark } from '@/components';
import { Tabs, TabPane } from 'view-design';
import My from './components/my';
import Dispose from './components/dispose';
import All from './components/all';
import ROLES from '@/constants/role';

export default {
    name: 'OaMissionMain',
    data() {
        return {
            ROLES,
            activeTab: this.$route.query.tab ? this.$route.query.tab : 'my'
        };
    },
    methods: {
        onTabChange(name) {
            this.activeTab = name;
            this.$router.push(`${this.$route.path}?tab=${name}`);
        }
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo'
        })
    },
    components: {
        Tabs,
        TabPane,
        Header,
        WaterMark,
        My,
        Dispose,
        All
    }
};
</script>
