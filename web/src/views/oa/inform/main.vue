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
import { Header, ListFooter, FilterQuery, WaterMark, Images } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaInformMain',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '推送首页',
                    prop: 'carousel',
                    list: [
                        { label: '是', value: 1 },
                        { label: '否', value: 0 }
                    ]
                }
            ],
            filters: {
                published: undefined
            },
            columns: [
                {
                    title: '文章编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('IA', p.row.created_at, p.row.id))
                },
                {
                    title: '标题',
                    minWidth: 120,
                    key: 'title'
                },
                {
                    title: '推送首页',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.carousel ? 'success' : 'default' } },
                            p.row.carousel ? '是' : '否'
                        )
                },
                {
                    title: '封面图片',
                    minWidth: 140,
                    render: (h, p) => {
                        if (p.row.carousel) {
                            return h(Images, { props: { imgs: [p.row.cover_img] } });
                        }

                        return h('span', '-');
                    }
                },
                {
                    title: '创建人',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'a',
                            {
                                on: {
                                    click: () => this.$router.push(`/oa/hr/colleague/detail/${p.row.created_by}`)
                                }
                            },
                            p.row.real_name
                        )
                },
                {
                    title: '创建时间',
                    key: 'created_at',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '发布时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.published_at).format('YYYY-MM-DD HH:mm:ss'))
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
                .post('/inform/list', data)
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
            this.$router.push(`/oa/inform/detail/${id}`);
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
