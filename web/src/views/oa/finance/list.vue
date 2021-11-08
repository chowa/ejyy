<template>
    <WaterMark>
        <Header />

        <Result type="error" title="当前物业公司不支持微信支付物业费用" v-if="!postInfo.wechat_payment">
            <div slot="extra">
                <p>
                    如需开通，请联系卓瓦科技工作人员或发送邮件至发信至
                    <a href="mailto:concat@chowa.cn">技术支持</a>
                    。
                </p>
            </div>
        </Result>

        <Card dis-hover :bordered="false" v-else>
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
import { Header, ListFooter, Result, WaterMark } from '@/components';
import { Card, Page, Spin, Table } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaFinanceList',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('PF', p.row.created_at, p.row.id))
                },
                {
                    title: '起始年份',
                    minWidth: 100,
                    key: 'start_year'
                },
                {
                    title: '结束年份',
                    minWidth: 100,
                    key: 'end_year'
                },
                {
                    title: '创建人',
                    minWidth: 120,
                    render: (h, p) =>
                        h('a', { on: { click: () => this.goColleague(p.row.created_by) } }, p.row.real_name)
                },
                {
                    title: '创建时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    minWidth: 280,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.printNotice(p.row.id) } }, '打印通知'),
                            h('a', { on: { click: () => this.goPay(p.row.id) } }, '现场缴费'),
                            h('a', { on: { click: () => this.goOrder(p.row.id) } }, '已缴费订单'),
                            h('a', { on: { click: () => this.goUnpay(p.row.id) } }, '未缴费房产')
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

            if (!postInfo.wechat_payment) return (this.fetching = false);

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/payment/list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        goOrder(id) {
            this.$router.push(`/oa/finance/order/${id}`);
        },
        goUnpay(id) {
            this.$router.push(`/oa/finance/unpay/${id}`);
        },
        goColleague(id) {
            this.$router.push(`/oa/hr/colleague/detail/${id}`);
        },
        printNotice(id) {
            this.$router.push(`/print/fee_notice?id=${id}`);
        },
        goPay(id) {
            this.$router.push(`/oa/finance/pay/${id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
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
        Result,
        WaterMark
    }
};
</script>
