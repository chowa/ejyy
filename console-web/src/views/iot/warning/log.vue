<template>
    <WaterMark>
        <Header />

        <Card dis-hover :bordered="false">
            <Table stripe :columns="columns" :data="list" />

            <ListFooter>
                <Page
                    show-total
                    show-elevator
                    show-sizer
                    :page-size="page_size"
                    :total="total"
                    :current="page_num"
                    @on-change="onPageChange"
                    @on-page-size-change="onPageSizeChange"
                />
            </ListFooter>
        </Card>
        <Spin size="large" fix v-if="fetching" />
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

import { mapGetters } from 'vuex';
import { Header, ListFooter, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Icon } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';
import ROLES from '@/constants/role';

export default {
    name: 'IotWarningLog',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '中控名称',
                    minWidth: 120,
                    key: 'warning'
                },
                {
                    title: '预警类型',
                    minWidth: 120,
                    render: (h, p) => {
                        let type;
                        let text;

                        switch (p.row.category) {
                            case 1:
                                type = 'ios-water';
                                text = '漏水';
                                break;

                            case 2:
                                type = 'ios-bonfire';
                                text = '起火';
                                break;

                            case 3:
                                type = 'ios-analytics';
                                text = '漏气';
                                break;
                        }

                        return h('span', [h(Icon, { props: { type, color: '#ed4014', size: 22 } }), text]);
                    }
                },
                {
                    title: '预警房产',
                    minWidth: 100,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.FCDA) && p.row.building_id) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => this.$router.push(`/basic/building/detail/${p.row.building_id}`)
                                    }
                                },
                                utils.building.text(p.row)
                            );
                        }

                        return h('span', p.row.building_id ? utils.building.text(p.row) : '-');
                    }
                },
                {
                    title: '预警时间',
                    key: 'created_at',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                }
            ]
        };
    },
    mixins: [pageMixin],
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getListData();
        }
    },
    methods: {
        getListData() {
            const { page_num, page_size, postInfo } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/warning/log', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getListData();
        }
    },
    components: {
        Header,
        ListFooter,
        Card,
        Page,
        Spin,
        Table,
        WaterMark
    }
};
</script>
