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

import { mapGetters } from 'vuex';
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'BasicOwerApplyList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '接收推送',
                    prop: 'subscribed',
                    list: [
                        { label: '是', value: 1 },
                        { label: '否', value: 0 }
                    ]
                },
                {
                    label: '认证进度',
                    prop: 'replied',
                    list: [
                        { label: '已处理', value: 1 },
                        { label: '未处理', value: 0 }
                    ]
                },
                {
                    label: '认证结果',
                    prop: 'success',
                    list: [
                        { label: '成功', value: 1 },
                        { label: '失败', value: 0 }
                    ]
                }
            ],
            filters: {
                replied: undefined,
                subscribed: undefined,
                success: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('A', p.row.created_at, p.row.id))
                },
                {
                    title: '业主姓名',
                    minWidth: 120,
                    key: 'real_name'
                },
                {
                    title: '申请信息',
                    minWidth: 120,
                    render: (h, p) => {
                        const ret = [];
                        if (p.row.house) {
                            ret.push(p.row.house);
                        }

                        if (p.row.carport) {
                            ret.push(p.row.carport);
                        }

                        if (p.row.warehouse) {
                            ret.push(p.row.warehouse);
                        }

                        return h('span', ret.join('，'));
                    }
                },
                {
                    title: '接受推送',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.subscribed ? 'success' : 'default' } },
                            p.row.subscribed ? '是' : '否'
                        )
                },
                {
                    title: '认证进度',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.replied ? 'success' : 'default' } },
                            p.row.replied ? '已处理' : '未处理'
                        )
                },
                {
                    title: '认证结果',
                    minWidth: 80,
                    render: (h, p) => {
                        if (!p.row.replied) {
                            return h('span', '-');
                        }

                        return h(
                            Tag,
                            { props: { color: p.row.success ? 'success' : 'error' } },
                            p.row.success ? '成功' : '失败'
                        );
                    }
                },
                {
                    title: '申请时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
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
                .post('/owner/apply_list', data)
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
            this.$router.push(`/basic/owner/apply/detail/${id}`);
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
