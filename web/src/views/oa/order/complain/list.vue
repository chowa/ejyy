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
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaComplainList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '当前进度',
                    prop: 'step',
                    list: [
                        { label: '待确认工单', value: 2 },
                        { label: '待维修', value: 3 },
                        { label: '已完成', value: 4 }
                    ]
                },
                {
                    label: '反馈类型',
                    prop: 'type',
                    list: [
                        { label: '投诉', value: 1 },
                        { label: '建议', value: 2 }
                    ]
                },
                {
                    label: '反馈分类',
                    prop: 'category',
                    list: [
                        { label: '卫生', value: 1 },
                        { label: '噪音', value: 2 },
                        { label: '服务态度', value: 3 },
                        { label: '违建', value: 4 },
                        { label: '占用消防通道', value: 5 },
                        { label: '小区设施', value: 6 },
                        { label: '其他', value: 7 }
                    ]
                },
                {
                    label: '工单来源',
                    prop: 'refer',
                    list: [
                        { label: '业主上报', value: 'ower' },
                        { label: '公司指派', value: 'colleague' }
                    ]
                }
            ],
            filters: {
                step: undefined,
                type: undefined,
                category: undefined,
                refer: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('C', p.row.created_at, p.row.id))
                },
                {
                    title: '问题描述',
                    minWidth: 180,
                    key: 'description'
                },
                {
                    title: '反馈类型',
                    minWidth: 100,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        switch (p.row.type) {
                            case 1:
                                text = '卫生';
                                color = 'magenta';
                                break;

                            case 2:
                                text = '建议';
                                color = 'red';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '反馈分类',
                    minWidth: 120,
                    render: (h, p) => {
                        let text = '';

                        switch (p.row.category) {
                            case 1:
                                text = '投诉';
                                break;

                            case 2:
                                text = '噪音';
                                break;

                            case 3:
                                text = '服务态度';
                                break;

                            case 4:
                                text = '违建';
                                break;

                            case 5:
                                text = '占用消防通道';
                                break;

                            case 6:
                                text = '小区设施';
                                break;

                            case 7:
                                text = '其他';
                                break;
                        }

                        return h('span', text);
                    }
                },
                {
                    title: '当前进度',
                    minWidth: 120,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        if (p.row.merge_id) {
                            text = '合并工单';
                            color = 'cyan';
                        } else {
                            switch (p.row.step) {
                                case 1:
                                    text = '待分配工单';
                                    color = 'geekblue';
                                    break;

                                case 2:
                                    text = '待确认工单';
                                    color = 'purple';
                                    break;

                                case 3:
                                    text = '待处理';
                                    color = 'orange';
                                    break;

                                case 4:
                                    text = '已完成';
                                    color = 'green';
                                    break;
                            }
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '申请时间',
                    key: 'created_at',
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
                .post('/complain/my_list', data)
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
            this.$router.push(`/oa/order/complain/detail/${id}`);
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
