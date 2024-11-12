<template>
    <section>
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
    </section>
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
import { ListFooter } from '@/components';
import { Card, Page, Spin, Table, Tag, Modal, Message } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaMissionDispose',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '任务编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('MN', p.row.created_at, p.row.id))
                },
                {
                    title: '巡检执行人',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'a',
                            {
                                on: {
                                    click: () => this.$router.push(`/oa/hr/colleague/detail/${p.row.user_id}`)
                                }
                            },
                            p.row.real_name
                        )
                },
                {
                    title: '任务开始日期',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.start_date).format('YYYY-MM-DD'))
                },
                {
                    title: '任务结束日期',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.end_date).format('YYYY-MM-DD'))
                },
                {
                    title: '上报开始时间',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'span',
                            moment()
                                .hour(p.row.start_hour)
                                .minute(0)
                                .format('HH:mm')
                        )
                },
                {
                    title: '上报结束时间',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'span',
                            moment()
                                .hour(p.row.end_hour)
                                .minute(0)
                                .format('HH:mm')
                        )
                },
                {
                    title: '任务分类',
                    minWidth: 120,
                    key: 'category'
                },
                {
                    title: '巡检路线',
                    minWidth: 120,
                    key: 'line'
                },
                {
                    title: '任务状态',
                    minWidth: 100,
                    render: (h, p) => {
                        if (p.row.cancel) {
                            return h(Tag, { props: { color: 'magenta' } }, '已取消');
                        }

                        if (p.row.start_date > Date.now()) {
                            return h(Tag, { props: { color: 'default' } }, '未开始');
                        }

                        if (p.row.end_date < Date.now()) {
                            return h(Tag, { props: { color: 'blue' } }, '已结束');
                        }

                        return h(Tag, { props: { color: 'cyan' } }, '进行中');
                    }
                },
                {
                    title: '创建时间',
                    minWidth: 140,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 120,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.goDetail(p.row.id) } }, '查看'),
                            Date.now() < p.row.end_date && !p.row.cancel
                                ? h('a', { on: { click: () => this.cancel(p.row.id, p.index) } }, '取消任务')
                                : null
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
            const { page_num, page_size, postInfo } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/mission/dispose', data)
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
            this.$router.push(`/oa/mission/detail/${id}`);
        },
        cancel(id, index) {
            Modal.confirm({
                title: '请确认',
                content: '确认要取消本次巡检吗？此操作不可恢复',
                onOk: () => {
                    const data = {
                        id,
                        community_id: this.postInfo.default_community_id
                    };

                    utils.request
                        .post('/mission/cancel', data)
                        .then(() => {
                            Message.success('取消任务成功');
                            const list = [].concat(this.list);
                            list[index].cancel = 1;
                            this.list = list;
                        })
                        .catch(() => {});
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
        ListFooter,
        Card,
        Page,
        Spin,
        Table
    }
};
</script>
