<template>
    <section>
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
import { ListFooter, FilterQuery } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaRefoundNotice',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '申请结果',
                    prop: 'success',
                    list: [
                        { label: '待审批', value: 0 },
                        { label: '已审批', value: 1 }
                    ]
                }
            ],
            filters: {
                success: undefined
            },
            columns: [
                {
                    title: '流程编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('RF', p.row.created_at, p.row.id))
                },
                {
                    title: '申请人',
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
                    title: '费用产生时间',
                    minWidth: 220,
                    render: (h, p) =>
                        h(
                            'span',
                            `${moment(p.row.begin_date).format('YYYY-MM-DD')}至${moment(p.row.finish_date).format(
                                'YYYY-MM-DD'
                            )}`
                        )
                },
                {
                    title: '报销原因',
                    minWidth: 120,
                    key: 'reason'
                },
                {
                    title: '报销金额',
                    minWidth: 120,
                    key: 'total'
                },
                {
                    title: '申请结果',
                    minWidth: 80,
                    render: (h, p) => {
                        if (p.row.cancel) {
                            return h(Tag, { props: { color: 'warning' } }, '已撤销');
                        }

                        if (p.row.success === null) {
                            return h(Tag, { props: { color: 'blue' } }, '审批中');
                        }

                        return h(
                            Tag,
                            { props: { color: p.row.success ? 'success' : 'red' } },
                            p.row.success ? '成功' : '驳回'
                        );
                    }
                },
                {
                    title: '申请时间',
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
            const { page_num, page_size, filters, postInfo } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id,
                ...filters
            };

            utils.request
                .post('/refound/notice', data)
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
            this.$router.push(`/oa/refound/detail/${id}`);
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
        Table,
        FilterQuery
    }
};
</script>
