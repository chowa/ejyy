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

import { mapGetters } from 'vuex';
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'BasicEpidemicList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '健康码颜色',
                    prop: 'tour_code',
                    list: [
                        { label: '绿色', value: 1 },
                        { label: '黄色', value: 2 },
                        { label: '红色', value: 3 }
                    ]
                },
                {
                    label: '外地返回',
                    prop: 'return_hometown',
                    list: [
                        { label: '是', value: 1 },
                        { label: '否', value: 0 }
                    ]
                }
            ],
            filters: {
                tour_code: undefined,
                return_hometown: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('E', p.row.created_at, p.row.id))
                },
                {
                    title: '登记住所',
                    minWidth: 180,
                    render: (h, p) => h('span', utils.building.text(p.row, false))
                },
                {
                    title: '健康码颜色',
                    minWidth: 120,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        switch (p.row.tour_code) {
                            case 1:
                                text = '绿色';
                                color = 'success';
                                break;

                            case 2:
                                text = '黄色';
                                color = 'warning';
                                break;

                            case 3:
                                text = '红色';
                                color = 'error';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '外地返回',
                    minWidth: 120,
                    render: (h, p) => {
                        const color = !p.row.return_hometown ? 'default' : 'orange';

                        return h(Tag, { props: { color } }, !p.row.return_hometown ? '否' : '是');
                    }
                },
                {
                    title: '登记时间',
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
                .post('/epidemic/list', data)
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
            this.$router.push(`/basic/epidemic/detail/${id}`);
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
