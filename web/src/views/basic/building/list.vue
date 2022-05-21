<template>
    <WaterMark>
        <Header />

        <FilterQuery :filterOptions="filterOptions" :filters="filters" class="mt-16" />

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
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'BasicBuildingList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '房产类型',
                    prop: 'type',
                    list: [
                        { label: '住宅', value: 1 },
                        { label: '车位', value: 2 },
                        { label: '仓房', value: 3 },
                        { label: '商户', value: 4 },
                        { label: '车库', value: 5 }
                    ]
                }
            ],
            filters: {
                type: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('B', p.row.created_at, p.row.id))
                },
                {
                    title: '详细',
                    minWidth: 180,
                    render: (h, p) => h('span', utils.building.text(p.row, false))
                },
                {
                    title: '房产类型',
                    minWidth: 120,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        switch (p.row.type) {
                            case 1:
                                text = '住宅';
                                color = 'geekblue';
                                break;

                            case 2:
                                text = '车位';
                                color = 'purple';
                                break;

                            case 3:
                                text = '仓房';
                                color = 'orange';
                                break;

                            case 4:
                                text = '商户';
                                color = 'cyan';
                                break;

                            case 5:
                                text = '车库';
                                color = 'blue';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '导入时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    minWidth: 80,
                    fixed: 'right',
                    render: (h, p) => h('a', { on: { click: () => this.goDetail(p.row.id) } }, '查看')
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
            const { page_num, page_size, postInfo, filters } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id,
                ...filters
            };

            utils.request
                .post('/building/list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        goDetail(id) {
            this.$router.push(`/basic/building/detail/${id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
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
        FilterQuery,
        WaterMark
    }
};
</script>
