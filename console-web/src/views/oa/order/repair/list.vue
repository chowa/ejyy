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
    name: 'OaOrderRepairList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '当前进度',
                    prop: 'step',
                    list: [
                        { label: '待工程确认', value: 2 },
                        { label: '待维修', value: 3 },
                        { label: '已完成', value: 4 }
                    ]
                },
                {
                    label: '维修类型',
                    prop: 'repair_type',
                    list: [
                        { label: '水暖', value: 1 },
                        { label: '电路', value: 2 },
                        { label: '门窗', value: 3 },
                        { label: '公共设施', value: 4 }
                    ]
                },
                {
                    label: '工单来源',
                    prop: 'refer',
                    list: [
                        { label: '业主上报', value: 'owner' },
                        { label: '公司指派', value: 'colleague' }
                    ]
                }
            ],
            filters: {
                step: undefined,
                repair_type: undefined,
                refer: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('R', p.row.created_at, p.row.id))
                },
                {
                    title: '维修地点',
                    minWidth: 180,
                    render: (h, p) => {
                        if (p.row.building_id === 0) {
                            return h('span', '公共设施/区域');
                        }

                        return h('span', utils.building.text(p.row));
                    }
                },
                {
                    title: '维修类型',
                    minWidth: 180,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        switch (p.row.repair_type) {
                            case 1:
                                text = '水暖';
                                color = 'magenta';
                                break;

                            case 2:
                                text = '电路';
                                color = 'red';
                                break;

                            case 3:
                                text = '门窗';
                                color = 'volcano';
                                break;

                            case 4:
                                text = '公共设施';
                                color = 'gold';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
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
                                    text = '待工程确认';
                                    color = 'purple';
                                    break;

                                case 3:
                                    text = '待维修';
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
                .post('/repair/my_list', data)
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
            this.$router.push(`/oa/order/repair/detail/${id}`);
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
