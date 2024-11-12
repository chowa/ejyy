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
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'BasicFitmentList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '当前进度',
                    prop: 'step',
                    list: [
                        { label: '业主申请', value: 1 },
                        { label: '准许装修', value: 2 },
                        { label: '装修完工', value: 3 },
                        { label: '物业确认', value: 4 }
                    ]
                },
                {
                    label: '返还保证金',
                    prop: 'is_return_cash_deposit',
                    list: [
                        { label: '已返还', value: 1 },
                        { label: '未返还', value: 0 }
                    ]
                }
            ],
            filters: {
                step: undefined,
                is_return_cash_deposit: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('F', p.row.created_at, p.row.id))
                },
                {
                    title: '装修建筑',
                    minWidth: 180,
                    render: (h, p) => h('span', utils.building.text(p.row, false))
                },
                {
                    title: '当前进度',
                    minWidth: 120,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        switch (p.row.step) {
                            case 1:
                                text = '业主申请';
                                color = 'geekblue';
                                break;

                            case 2:
                                text = '准许装修';
                                color = 'purple';
                                break;

                            case 3:
                                text = '装修完工';
                                color = 'orange';
                                break;

                            case 4:
                                text = '物业确认';
                                color = 'green';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '返还保证金',
                    minWidth: 120,
                    render: (h, p) => {
                        if (p.row.step !== 4 || !this.fitment_pledge) {
                            return h('span', '-');
                        }

                        const color = !p.row.is_return_cash_deposit ? 'default' : 'green';

                        return h(Tag, { props: { color } }, !p.row.is_return_cash_deposit ? '未返还' : '已返还');
                    }
                },
                {
                    title: '申请时间',
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
                .post('/fitment/list', data)
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
            this.$router.push(`/basic/fitment/detail/${id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        fitment_pledge() {
            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].fitment_pledge;
        }
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
