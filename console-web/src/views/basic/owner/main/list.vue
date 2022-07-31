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
    name: 'BasicOwerList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '业主手机号',
                    prop: 'phone',
                    type: 'text',
                    pattern: /^1\d{10}$/
                },
                {
                    label: '关注公众号',
                    prop: 'subscribed',
                    list: [
                        { label: '已关注', value: 1 },
                        { label: '未关注', value: 0 }
                    ]
                }
            ],
            filters: {
                phone: undefined,
                subscribed: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('O', p.row.created_at, p.row.id))
                },
                {
                    title: '业主姓名',
                    minWidth: 120,
                    key: 'real_name'
                },
                {
                    title: '昵称',
                    minWidth: 120,
                    key: 'nick_name'
                },
                {
                    title: '性别',
                    minWidth: 60,
                    render: (h, p) => {
                        let color;
                        let text;

                        if (p.row.gender === 1) {
                            color = 'blue';
                            text = '男';
                        } else if (p.row.gender === 2) {
                            color = 'magenta';
                            text = '女';
                        } else {
                            color = 'default';
                            text = '未知';
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '身份信息',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.intact ? 'success' : 'default' } },
                            p.row.intact ? '已完善' : '未完善'
                        )
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
                    title: '注册时间',
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
                .post('/owner/list', data)
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
            this.$router.push(`/basic/owner/detail/${id}`);
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
