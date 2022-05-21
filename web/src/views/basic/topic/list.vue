<template>
    <section>
        <Header />

        <FilterQuery :filterOptions="filterOptions" :filters="filters" />

        <Card dis-hover :bordered="false">
            <Table stripe :columns="columns" :data="list" />

            <ListFooter>
                <Page
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
    </section>
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
import { Header, FilterQuery, ListFooter } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import * as utils from '@/utils';
import * as config from '@/config';
import pageMixin from '@/mixins/page';
import moment from 'moment';

export default {
    name: 'BasicTopicList',
    data() {
        return {
            filterOptions: [
                {
                    label: '发布状态',
                    prop: 'published',
                    list: [
                        { label: '已发布', value: 1 },
                        { label: '未发布', value: 0 }
                    ]
                }
            ],
            filters: {
                published: undefined
            },
            fetching: true,
            columns: [
                {
                    title: '索引',
                    key: 'id',
                    minWidth: 70
                },
                {
                    title: '专题标题',
                    minWidth: 180,
                    key: 'title'
                },
                {
                    title: 'banner图',
                    minWidth: 180,
                    render: (h, p) =>
                        h('img', { attrs: { src: `${config.ASSET_HOST}${p.row.banner_img}`, width: 180 } })
                },
                {
                    title: '发布状态',
                    minWidth: 120,
                    render: (h, p) => {
                        const color = p.row.published === 0 ? 'default' : 'green';

                        return h(Tag, { props: { color } }, p.row.published === 0 ? '未发布' : '已发布');
                    }
                },
                {
                    title: '创建时间',
                    key: 'created_at',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
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
                    title: '操作',
                    key: 'id',
                    minWidth: 100,
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.update(p.row.id) } }, '修改'),
                            h('a', { on: { click: () => this.preview(p.row.id) } }, '预览')
                        ])
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
            const { page_num, page_size, filters, postInfo } = this;

            this.fetching = true;

            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id,
                ...filters
            };

            utils.request.post('/topic/list', data).then(res => {
                this.fetching = false;
                this.page_num = res.data.page_num;
                this.page_size = res.data.page_size;
                this.list = res.data.list;
                this.total = res.data.total;
            });
        },
        update(id) {
            this.$router.push(`/basic/topic/update/${id}`);
        },
        preview(id) {
            this.$router.push(`/basic/topic/preview/${id}`);
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
        FilterQuery,
        ListFooter,
        Card,
        Page,
        Spin,
        Table
    }
};
</script>
