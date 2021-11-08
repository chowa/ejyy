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
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';

export default {
    name: 'OaHrColleagueList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '手机号码',
                    prop: 'phone',
                    type: 'text',
                    pattern: /^1\d{10}$/
                },
                {
                    label: '同事姓名',
                    prop: 'name',
                    type: 'text',
                    min: 2
                }
            ],
            filters: {
                phone: undefined,
                name: undefined
            },
            columns: [
                {
                    title: '姓名',
                    minWidth: 120,
                    key: 'real_name'
                },
                {
                    title: '手机号码',
                    minWidth: 120,
                    key: 'phone'
                },
                {
                    title: '部门',
                    minWidth: 80,
                    render: (h, p) => h('span', p.row.department ? p.row.department : '-')
                },
                {
                    title: '岗位',
                    minWidth: 80,
                    render: (h, p) => h('span', p.row.job ? p.row.job : '-')
                },
                {
                    title: '关注公众号',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.subscribed ? 'success' : 'warning' } },
                            p.row.subscribed ? '已关注' : '未关注'
                        )
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 80,
                    fixed: 'right',
                    render: (h, p) => h('a', { on: { click: () => this.goDetail(p.row.id) } }, '查看')
                }
            ]
        };
    },
    mixins: [pageMixin],
    mounted() {
        this.getListData();
    },
    methods: {
        getListData() {
            const { page_num, page_size, filters } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                ...filters
            };

            utils.request
                .post('/colleague/list', data)
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
            this.$router.push(`/oa/hr/colleague/detail/${id}`);
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
