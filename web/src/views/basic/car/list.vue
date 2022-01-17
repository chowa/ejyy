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
    name: 'BasicCarList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '车辆类型',
                    prop: 'car_type',
                    list: [
                        { label: '7座及以下小客车/小型货车', value: 1 },
                        { label: '7座以上客车/中大型货车', value: 2 }
                    ]
                },
                {
                    label: '新能源车',
                    prop: 'is_new_energy',
                    list: [
                        { label: '是', value: 1 },
                        { label: '否', value: 0 }
                    ]
                },
                {
                    label: '绑定状态',
                    prop: 'status',
                    list: [
                        { label: '绑定中', value: 0 },
                        { label: '已解绑', value: 1 }
                    ]
                },
                {
                    label: '同步状态',
                    prop: 'sync',
                    list: [
                        { label: '未同步', value: 0 },
                        { label: '已同步', value: 1 }
                    ]
                },
                {
                    label: '车牌号码',
                    prop: 'car_number',
                    type: 'text',
                    max: 8,
                    min: 7,
                    pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
                }
            ],
            filters: {
                car_type: undefined,
                is_new_energy: undefined,
                status: undefined,
                car_number: undefined,
                sync: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('P', p.row.created_at, p.row.id))
                },
                {
                    title: '车牌号码',
                    minWidth: 120,
                    key: 'car_number'
                },
                {
                    title: '绑定房产',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.building.text(p.row))
                },
                {
                    title: '车辆类型',
                    minWidth: 200,
                    render: (h, p) =>
                        h('span', p.row.car_type === 1 ? '7座及以下小客车/小型货车' : '7座以上客车/中大型货车')
                },
                {
                    title: '新能源',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.is_new_energy ? 'success' : 'default' } },
                            p.row.is_new_energy ? '是' : '否'
                        )
                },
                {
                    title: '绑定状态',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.status ? 'green' : 'purple' } },
                            p.row.status ? '绑定中' : '已解绑'
                        )
                },
                {
                    title: '同步状态',
                    minWidth: 100,
                    render: (h, p) =>
                        h(Tag, { props: { color: p.row.sync ? 'success' : 'error' } }, p.row.sync ? '已同步' : '未同步')
                },
                {
                    title: '创建时间',
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
                .post('/car/list', data)
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
            this.$router.push(`/basic/car/detail/${id}`);
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
