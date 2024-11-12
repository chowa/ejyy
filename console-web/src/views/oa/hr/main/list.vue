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
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaHrColleagueList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '是否离职',
                    prop: 'status',
                    list: [
                        { label: '工作中', value: 0 },
                        { label: '已离职', value: 1 }
                    ]
                },
                {
                    label: '员工姓名',
                    prop: 'name',
                    type: 'text',
                    min: 2
                }
            ],
            filters: {
                phone: undefined,
                name: undefined,
                status: undefined
            },
            columns: [
                {
                    title: '姓名',
                    minWidth: 120,
                    key: 'real_name'
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
                    title: '是否离职',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.leave_office ? 'error' : 'green' } },
                            p.row.leave_office ? '已离职' : '工作中'
                        )
                },
                {
                    title: '入职时间',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.join_company_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 160,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.goDetail(p.row.id) } }, '查看'),
                            h('a', { on: { click: () => this.goSign(p.row.id) } }, '考勤信息'),
                            p.row.leave_office
                                ? ''
                                : h('a', { on: { click: () => this.goUpdate(p.row.id) } }, '更新资料')
                        ])
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
                .post('/hr/list', data)
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
            this.$router.push(`/oa/hr/detail/${id}`);
        },
        goUpdate(id) {
            this.$router.push(`/oa/hr/update/${id}`);
        },
        goSign(id) {
            this.$router.push(`/oa/hr/sign/${id}`);
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
