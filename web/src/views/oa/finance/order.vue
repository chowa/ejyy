<template>
    <WaterMark>
        <Header back />

        <FeeDetail />

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

        <Drawer :title="drawerTitle" placement="right" :width="drawerWidth" v-model="showDrawer">
            <WaterMark>
                <OrderDetail :detail="detail" :refundItem="judgeRefoundItem" :refundQueryItem="refundQueryItem" />
            </WaterMark>
            <Spin size="large" fix v-if="getting" />
        </Drawer>

        <Modal title="退款信息" v-model="showModal">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="name" label="退款账号：">
                    <Input v-model="form.refund_recv_accout" placeholder="请输入退款账号" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="cashRefoundApply">确认</Button>
            </div>
        </Modal>
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Page, Tag, Table, Drawer, Message, Modal, Form, FormItem, Input, Button } from 'view-design';
import { ListFooter, Header, FilterQuery, WaterMark } from '@/components';
import * as utils from '@/utils';
import pageMixin from '@/mixins/page';
import FeeDetail from './components/fee-detail';
import moment from 'moment';
import OrderDetail from './components/order-detail';

export default {
    name: 'OaFinanceOrder',
    data() {
        return {
            drawerTitle: '',
            showDrawer: false,
            getting: false,
            detail: {
                info: {},
                items: []
            },
            fetching: true,
            list: [],
            payExpire: 30 * 60 * 1000,
            filterOptions: [
                {
                    label: '支付状态',
                    prop: 'status',
                    list: [
                        { label: '取消订单', value: 1 },
                        { label: '支付成功', value: 2 },
                        { label: '退款中', value: 3 },
                        { label: '退款完成', value: 4 },
                        { label: '订单超时', value: 5 },
                        { label: '待支付', value: 6 }
                    ]
                },
                {
                    label: '订单号码',
                    prop: 'no',
                    type: 'text'
                }
            ],
            filters: {
                status: undefined
            },
            columns: [
                {
                    title: '订单号',
                    minWidth: 140,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYYMMDD') + '' + p.row.id)
                },
                {
                    title: '交易单号',
                    minWidth: 240,
                    render: (h, p) => h('span', p.row.transaction_id ? p.row.transaction_id : '-')
                },
                {
                    title: '支付方式',
                    minWidth: 100,
                    render: (h, p) => {
                        if (p.row.paid) {
                            return h('span', p.row.is_cash ? '现金支付' : '微信支付');
                        }

                        return h('span', '-');
                    }
                },
                {
                    title: '应支付费用',
                    minWidth: 110,
                    render: (h, p) => h('span', utils.payment.yuan(p.row.fee))
                },
                {
                    title: '实际支付费用',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.payment.yuan(p.row.paid_fee))
                },
                {
                    title: '订单状态',
                    minWidth: 180,
                    render: (h, p) => {
                        let text = '';
                        let color = '';

                        if (p.row.cancel) {
                            text = '取消订单';
                            color = 'orange';
                        } else if (p.row.refunding && !p.row.refunded) {
                            text = '退款中';
                            color = 'magenta';
                        } else if (p.row.refunding && p.row.refunded) {
                            text = p.row.paid_fee === 0 ? '全部退款完成' : '部分退款完成';
                            color = 'red';
                        } else if (p.row.paid) {
                            text = '已支付';
                            color = 'green';
                        } else if (Date.now() - this.payExpire >= p.row.created_at) {
                            text = '订单超时';
                            color = 'yellow';
                        } else {
                            text = '待支付';
                            color = 'cyan';
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '创建时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    minWidth: 180,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.showDetail(p.row) } }, '查看'),
                            p.row.paid && p.row.paid_fee > 0
                                ? h('a', { on: { click: () => this.printOrder(p.row.id) } }, '打印凭证')
                                : null
                        ])
                }
            ],
            showModal: false,
            form: {
                refund_recv_accout: ''
            },
            rules: {
                refund_recv_accout: [
                    { required: true, message: '请输入退款账号' },
                    { max: 64, message: '退款账号不能大于64个字符' }
                ]
            },
            refoundItem: null
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

            const data = {
                property_fee_id: this.$route.params.id,
                community_id: postInfo.default_community_id,
                page_num,
                page_size,
                ...filters
            };

            utils.request
                .post('/payment/order_list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                    this.payExpire = res.data.payExpire;
                })
                .catch(() => (this.fetching = false));
        },
        showDetail(info) {
            const data = {
                order_id: info.id,
                community_id: this.postInfo.default_community_id
            };

            this.getting = true;
            this.drawerTitle = `订单「${moment(info.created_at).format('YYYYMMDD')}${info.id}」详情`;
            this.showDrawer = true;
            this.detail = {
                info: {},
                items: []
            };

            utils.request.post('/payment/order_detail', data).then(res => {
                this.detail = res.data;
                this.getting = false;
            });
        },
        judgeRefoundItem(item) {
            if (this.detail.info.is_cash) {
                this.refoundItem = item;
                this.showModal = true;
            } else {
                this.refundItem(item);
            }
        },
        cashRefoundApply() {
            this.refundItem({
                ...this.refoundItem,
                ...this.form
            });

            this.form.refund_recv_accout = '';
            this.$refs.form.resetFields();
            this.showModal = false;
        },
        hideModal() {
            this.showModal = false;
            this.refoundItem = null;
        },
        refundItem(item) {
            const data = {
                order_id: this.detail.info.order_id,
                community_id: this.postInfo.default_community_id,
                order_item_id: item.id,
                refund_recv_accout: this.detail.info.is_cash ? item.refund_recv_accout : undefined
            };

            this.getting = true;

            utils.request
                .post('/payment/refund', data)
                .then(res => {
                    const index = this.detail.items.findIndex(row => row.id === item.id);
                    const items = [].concat(this.detail.items);

                    items[index] = {
                        ...items[index],
                        refund_apply_at: res.data.refund_apply_at,
                        refund_recv_accout: this.detail.info.is_cash ? item.refund_recv_accout : null,
                        refund_id: this.detail.info.is_cash ? res.data.refund_id : null
                    };

                    this.detail = {
                        info: {
                            ...this.detail.info,
                            refunding: true
                        },
                        items
                    };
                    this.getting = false;
                    this.getListData();
                    Message.success('申请退款成功');
                })
                .catch(() => (this.getting = false));
        },
        refundQueryItem(item) {
            const data = {
                order_id: this.detail.info.order_id,
                community_id: this.postInfo.default_community_id,
                order_item_id: item.id
            };

            this.getting = true;

            utils.request
                .post('/payment/refund_query', data)
                .then(res => {
                    if (res.data.refund_id) {
                        const index = this.detail.items.findIndex(row => row.id === item.id);

                        const items = [].concat(this.detail.items);

                        items[index] = {
                            ...items[index],
                            refund_at: res.data.refund_at,
                            refund_id: res.data.refund_id,
                            refund_fee: res.data.refund_fee,
                            refund_account: res.data.refund_account,
                            refund_recv_accout: res.data.refund_recv_accout,
                            refund_status: res.data.refund_status
                        };
                        this.detail = {
                            info: {
                                ...this.detail.info,
                                refunded: res.data.refunded
                            },
                            items
                        };
                    }
                    this.getting = false;
                    Message.success('更新退款进度成功');
                })
                .catch(() => (this.getting = false));
        },
        printOrder(id) {
            this.$router.push(`/print/fee_order?id=${id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        },
        drawerWidth() {
            if (window.innerWidth <= 480) {
                return 300;
            }

            return 740;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getListData();
        }
    },
    components: {
        Card,
        Spin,
        Page,
        ListFooter,
        Table,
        Tag,
        Header,
        FeeDetail,
        FilterQuery,
        Drawer,
        OrderDetail,
        Modal,
        Form,
        FormItem,
        Input,
        Button,
        WaterMark
    }
};
</script>
