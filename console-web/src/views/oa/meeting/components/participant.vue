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
import { ListFooter } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaMeetingParticipant',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '会议编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('MT', p.row.created_at, p.row.id))
                },
                {
                    title: '会议发起人',
                    minWidth: 100,
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
                    title: '会议时间',
                    minWidth: 240,
                    render: (h, p) =>
                        h(
                            'span',
                            `${moment(p.row.start_time).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(
                                p.row.end_time
                            ).format('HH:mm:ss')}`
                        )
                },
                {
                    title: '会议主题',
                    minWidth: 220,
                    key: 'theme'
                },
                {
                    title: '会议室名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '会议室位置',
                    minWidth: 120,
                    key: 'local'
                },
                {
                    title: '会议状态',
                    minWidth: 80,
                    render: (h, p) => {
                        const now = Date.now();

                        if (p.row.cancel) {
                            return h(Tag, { props: { color: 'volcano' } }, '已取消');
                        }

                        if (p.row.start_time > now) {
                            return h(Tag, { props: { color: 'blue' } }, '未开始');
                        }

                        if (p.row.start_time <= now && p.row.end_time >= now) {
                            return h(Tag, { props: { color: 'red' } }, '进行中');
                        }

                        return h(Tag, { props: { color: 'default' } }, '已结束');
                    }
                },
                {
                    title: '预定时间',
                    minWidth: 120,
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
            const { page_num, page_size, postInfo } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/meeting/participant', data)
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
            this.$router.push(`/oa/meeting/detail/${id}`);
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
