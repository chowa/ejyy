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
import { Card, Page, Spin, Table, Tag, Modal, Message } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'BasicQuestionnaireList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '发布状态',
                    prop: 'published',
                    list: [
                        { label: '已发布', value: 1 },
                        { label: '未发布', value: 0 }
                    ]
                },
                {
                    label: '统计状态',
                    prop: 'expired',
                    list: [
                        { label: '已统计完毕', value: 1 },
                        { label: '未统计完毕', value: 0 }
                    ]
                }
            ],
            filters: {
                published: undefined,
                expired: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('Q', p.row.created_at, p.row.id))
                },
                {
                    title: '问卷标题',
                    minWidth: 160,
                    key: 'title'
                },
                {
                    title: '发布状态',
                    minWidth: 100,
                    render: (h, p) => {
                        const color = !p.row.published ? 'default' : 'green';

                        return h(Tag, { props: { color } }, !p.row.published ? '未发布' : '已发布');
                    }
                },
                {
                    title: '统计状态',
                    minWidth: 100,
                    render: (h, p) => {
                        if (!p.row.published) return h('span', '-');

                        const color = p.row.expire > Date.now() ? 'default' : 'green';

                        return h(Tag, { props: { color } }, p.row.expire > Date.now() ? '未统计完毕' : '已统计完毕');
                    }
                },
                {
                    title: '创建时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '发布时间',
                    minWidth: 180,
                    render: (h, p) =>
                        h('span', p.row.published ? moment(p.row.published_at).format('YYYY-MM-DD HH:mm:ss') : '-')
                },
                {
                    title: '操作',
                    minWidth: 220,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h(
                                'a',
                                { on: { click: () => this.goPreview(p.row.id) } },
                                !p.row.published ? '预览问卷' : '统计结果'
                            ),
                            !p.row.published
                                ? h('a', { on: { click: () => this.goUpdate(p.row.id) } }, '修改问卷')
                                : '',
                            !p.row.published
                                ? h('a', { on: { click: () => this.doPublish(p.row, p.index) } }, '发布问卷')
                                : ''
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
            const { page_num, page_size, postInfo, filters } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id,
                ...filters
            };

            utils.request
                .post('/questionnaire/list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        goPreview(id) {
            this.$router.push(`/basic/questionnaire/preview/${id}`);
        },
        goUpdate(id) {
            this.$router.push(`/basic/questionnaire/update/${id}`);
        },
        doPublish(record, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要发布「${record.title}」问卷吗？发布后将不可修改`,
                onOk: () => {
                    const data = {
                        community_id: this.postInfo.default_community_id,
                        id: record.id
                    };

                    utils.request.post('/questionnaire/published', data).then(res => {
                        this.list[index].published = true;
                        this.list[index].published_at = res.data.published_at;
                        Message.success('问卷发布成功');
                    });
                }
            });
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
