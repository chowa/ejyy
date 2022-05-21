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
    name: 'BasicMovecarList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '处理状态',
                    prop: 'finish',
                    list: [
                        { label: '已处理', value: true },
                        { label: '未处理', value: false }
                    ]
                },
                {
                    label: '挪车电话',
                    prop: 'have_concat_info',
                    list: [
                        { label: '库中有', value: true },
                        { label: '库中没有', value: false }
                    ]
                }
            ],
            filters: {
                finish: undefined,
                have_concat_info: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('M', p.row.created_at, p.row.id))
                },
                {
                    title: '车牌号码',
                    minWidth: 120,
                    key: 'car_number'
                },
                {
                    title: '挪车原因',
                    minWidth: 180,
                    render: (h, p) => {
                        let text;

                        switch (p.row.move_reason) {
                            case 1:
                                text = '阻碍通行';
                                break;

                            case 2:
                                text = '占用消防通道';
                                break;

                            case 3:
                                text = '阻挡出入口';
                                break;

                            case 4:
                                text = '影响施工';
                                break;

                            case 5:
                                text = '占用车位';
                                break;
                        }

                        return h('span', text);
                    }
                },
                {
                    title: '库中是否有挪车电话',
                    minWidth: 100,
                    render: (h, p) => {
                        const color = !p.row.have_concat_info ? 'default' : 'green';

                        return h(Tag, { props: { color } }, !p.row.have_concat_info ? '没有' : '有');
                    }
                },
                {
                    title: '处理状态',
                    minWidth: 120,
                    render: (h, p) => {
                        const color = !p.row.responsed_at ? 'default' : 'green';

                        return h(Tag, { props: { color } }, !p.row.responsed_at ? '未处理' : '已处理');
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
                .post('/move_car/list', data)
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
            this.$router.push(`/basic/movecar/detail/${id}`);
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
