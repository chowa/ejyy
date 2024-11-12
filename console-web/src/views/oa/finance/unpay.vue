<template>
    <WaterMark>
        <Header back />

        <FeeDetail @on-fee-load="onFeeLoad" />

        <FilterQuery :filterOptions="filterOptions" :filters="filters" class="mt-16" />

        <Card dis-hover :bordered="false" class="mt-16">
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
            <Spin size="large" fix v-if="fetching" />
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import FeeDetail from './components/fee-detail';
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag, Message } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'OaFinanceUnpay',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '房产类型',
                    prop: 'type',
                    list: [
                        { label: '住宅', value: 1 },
                        { label: '车位', value: 2 },
                        { label: '仓房', value: 3 },
                        { label: '商户', value: 4 },
                        { label: '车库', value: 5 }
                    ]
                }
            ],
            filters: {
                type: undefined
            },
            fee: {},
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('B', p.row.created_at, p.row.id))
                },
                {
                    title: '详细',
                    minWidth: 180,
                    render: (h, p) => h('span', utils.building.text(p.row, false))
                },
                {
                    title: '房产类型',
                    minWidth: 120,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        switch (p.row.type) {
                            case 1:
                                text = '住宅';
                                color = 'geekblue';
                                break;

                            case 2:
                                text = '车位';
                                color = 'purple';
                                break;

                            case 3:
                                text = '仓房';
                                color = 'orange';
                                break;

                            case 4:
                                text = '商户';
                                color = 'cyan';
                                break;

                            case 5:
                                text = '车库';
                                color = 'blue';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '建筑面积',
                    key: 'construction_area',
                    minWidth: 100
                },
                {
                    title: '物业费用',
                    minWidth: 100,
                    render: (h, p) => h('span', utils.payment.yuan(this.computedFee(p.row)))
                },
                {
                    title: '操作',
                    minWidth: 220,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            this.userInfo.access.includes(ROLES.FCDA)
                                ? h('a', { on: { click: () => this.goDetail(p.row.id) } }, '业主信息')
                                : null,
                            h('a', { on: { click: () => this.wechatOaPush(p.row.id) } }, '微信公众号通知'),
                            h('a', { on: { click: () => this.smsPush(p.row.id) } }, '短信通知'),
                            h('a', { on: { click: () => this.printUrge(p.row) } }, '打印催缴单')
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

            if (!postInfo.wechat_payment) return;

            this.fetching = true;
            const data = {
                property_fee_id: this.$route.params.id,
                page_num,
                page_size,
                community_id: postInfo.default_community_id,
                ...filters
            };

            utils.request
                .post('/payment/unpay_list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        onFeeLoad(data) {
            this.fee = data;
        },
        computedFee(info) {
            let fen;
            let computed_by_area;
            let ret = 0;

            if (info.type === 1) {
                fen = this.fee.house_fee;
                computed_by_area = this.fee.computed_house_fee_by_area;
            } else if (info.type === 2) {
                fen = this.fee.carport_fee;
                computed_by_area = this.fee.computed_carport_fee_by_area;
            } else if (info.type === 3) {
                fen = this.fee.warehoure_fee;
                computed_by_area = this.fee.computed_warehouse_fee_by_area;
            } else if (info.type === 4) {
                fen = this.fee.merchant_fee;
                computed_by_area = this.fee.computed_merchant_fee_by_area;
            } else if (info.type === 5) {
                fen = this.fee.garage_fee;
                computed_by_area = this.fee.computed_garage_fee_by_area;
            }

            if (!computed_by_area) {
                ret = Math.floor(fen);
            } else {
                ret = Math.floor(info.construction_area * fen);
            }

            return ret;
        },
        goDetail(id) {
            this.$router.push(`/basic/building/detail/${id}`);
        },
        wechatOaPush(id) {
            const $msg = Message.loading({
                content: '微信公众号推送中……',
                duration: 0
            });

            const data = {
                property_fee_id: this.$route.params.id,
                community_id: this.postInfo.default_community_id,
                building_id: id,
                type: 'oa'
            };

            utils.request
                .post('/payment/urge', data)
                .then(res => {
                    $msg();
                    Message.success(`向${res.data.total}位业主推送微信成功，失败${res.data.error}位`);
                })
                .catch(() => $msg());
        },
        smsPush(id) {
            const $msg = Message.loading({
                content: '短信推送中……',
                duration: 0
            });

            const data = {
                property_fee_id: this.$route.params.id,
                community_id: this.postInfo.default_community_id,
                building_id: id,
                type: 'sms'
            };

            utils.request
                .post('/payment/urge', data)
                .then(res => {
                    $msg();
                    Message.success(`向${res.data.total}位业主推送短信成功，失败${res.data.error}位`);
                })
                .catch(() => $msg());
        },
        printUrge(info) {
            this.$router.push(
                `/print/fee_urge?building=${utils.building.text(info)}&fee=${this.computedFee(info)}&start_year=${
                    this.fee.start_year
                }&end_year=${this.fee.end_year}`
            );
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
        FilterQuery,
        FeeDetail,
        WaterMark
    }
};
</script>
