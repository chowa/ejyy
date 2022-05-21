<template>
    <div>
        <Divider plain orientation="left">订单信息</Divider>
        <Row class="detail-row">
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">小区名称</span>
                <div class="detail-content">{{ community_name }}</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">收费年份</span>
                <div class="detail-content">{{ detail.info.start_year }}年至{{ detail.info.end_year }}年</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">住宅物业费</span>
                <div class="detail-content">{{ detail.info.house_fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    住宅物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.computed_house_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.info.computed_house_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">车位物业费</span>
                <div class="detail-content">{{ detail.info.carport_fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    车位物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.computed_carport_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.info.computed_carport_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">仓房物业费</span>
                <div class="detail-content">{{ detail.info.warehoure_fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    仓房物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.computed_warehouse_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.info.computed_warehouse_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">商户物业费</span>
                <div class="detail-content">{{ detail.info.merchant_fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    商户物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.computed_merchant_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.info.computed_merchant_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">车库物业费</span>
                <div class="detail-content">{{ detail.info.garage_fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    车库物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.computed_garage_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.info.computed_garage_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    微信公众号推送收费通知
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.wechat_push ? 'green' : 'default'">
                        {{ detail.info.wechat_push ? '是' : '否' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    短信推送收费通知
                </span>
                <div class="detail-content">
                    <Tag :color="detail.info.sms_push ? 'green' : 'default'">
                        {{ detail.info.sms_push ? '是' : '否' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    订单创建人
                </span>
                <div class="detail-content">
                    <router-link
                        :to="`/basic/ower/detail/${detail.info.wechat_mp_user_id}`"
                        v-if="userInfo.access.includes(ROLES.YZDA)"
                    >
                        {{ detail.info.real_name }}
                    </router-link>
                    <span v-else>{{ detail.info.real_name }}</span>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">创建时间</span>
                <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">订单号</span>
                <div class="detail-content">{{ tradeNo }}</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">
                    订单状态
                </span>
                <div class="detail-content">
                    <Tag :color="orderStatus.color">{{ orderStatus.text }}</Tag>
                </div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">订单金额</span>
                <div class="detail-content">{{ detail.info.fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <span class="detail-label">实际支付</span>
                <div class="detail-content">{{ detail.info.paid_fee | yuan }}元</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24" v-if="detail.info.cancel">
                <span class="detail-label">
                    取消订单时间
                </span>
                <div class="detail-content">{{ detail.info.cancel_at | mom_format }}</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24" v-if="detail.info.paid">
                <span class="detail-label">
                    支付时间
                </span>
                <div class="detail-content">{{ detail.info.paid_at | mom_format }}</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24" v-if="detail.info.paid">
                <span class="detail-label">支付方式</span>
                <div class="detail-content">{{ detail.info.is_cash ? '现金支付' : '微信支付' }}</div>
            </Col>
            <Col :lg="12" :sm="12" :xs="24" v-if="detail.info.paid">
                <span class="detail-label">交易单号</span>
                <div class="detail-content">{{ detail.info.transaction_id }}</div>
            </Col>
        </Row>

        <div v-for="(item, key) in detail.items" :key="key">
            <Divider plain orientation="left">子订单详细（{{ key + 1 }}）</Divider>
            <Row class="detail-row">
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">
                        收费单位
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/building/detail/${item.building_id}`"
                            v-if="userInfo.access.includes(ROLES.FCDA)"
                        >
                            {{ item | building }}
                        </router-link>
                        <span v-else>{{ item | building }}</span>
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">建筑面积</span>
                    <div class="detail-content">{{ item.construction_area }}平方米</div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">收取费用</span>
                    <div class="detail-content">{{ item.fee | yuan }}元</div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="!item.refund_apply_at && detail.info.paid">
                    <span
                        v-if="detail.info.created_at < Date.now() - detail.info.refoundExpire"
                        class="text-color-light"
                    >
                        支付已超过{{ Math.floor(detail.info.refoundExpire / (1000 * 60 * 60 * 24)) }}日，无法退款
                    </span>
                    <Button v-else type="error" shape="circle" size="small" @click="applyRefund(item)">申请退款</Button>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at">
                    <span class="detail-label">退款金额</span>
                    <div class="detail-content">{{ item.fee | yuan }}元</div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at">
                    <span class="detail-label">申请退款时间：</span>
                    <div class="detail-content">{{ item.refund_apply_at | mom_format }}</div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at">
                    <span class="detail-label">
                        退款状态
                    </span>
                    <div class="detail-content">
                        <Tag :color="item.refund ? 'warning' : 'geekblue'">
                            {{ item.refund ? '已退款' : '退款中' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at">
                    <span class="detail-label">
                        退款操作人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${item.operate_user_id}`">
                            {{ item.operate_user_real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at && !item.refund">
                    <Button type="warning" shape="circle" size="small" @click="refundQuery(item)">查询退款进度</Button>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at && item.refund">
                    <span class="detail-label">
                        退款交易号
                    </span>
                    <div class="detail-content">{{ item.refund_id }}</div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at && item.refund">
                    <span class="detail-label">
                        退款时间
                    </span>
                    <div class="detail-content">{{ item.refund_at | mom_format }}</div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at && item.refund">
                    <span class="detail-label">
                        退款结果
                    </span>
                    <div class="detail-content">
                        <Tag :color="item.refund_status ? 'success' : 'error'">
                            {{ item.refund_status ? '成功' : '失败' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24" v-if="item.refund_apply_at && item.refund">
                    <span class="detail-label">
                        退款入账账户
                    </span>
                    <div class="detail-content">{{ item.refund_recv_accout ? item.refund_recv_accout : '-' }}</div>
                </Col>
            </Row>
        </div>
    </div>
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
import { Row, Col, Tag, Divider, Button, Modal } from 'view-design';
import { Empty } from '@/components';
import ROLES from '@/constants/role';
import moment from 'moment';
import * as utils from '@/utils';

export default {
    name: 'FinanceOrderDetail',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    info: {},
                    items: []
                };
            }
        },
        refundItem: Function,
        refundQueryItem: Function
    },
    data() {
        return {
            ROLES,
            now: Date.now()
        };
    },
    methods: {
        applyRefund(info) {
            Modal.confirm({
                title: '请确认',
                content: `确认要为订单「${this.tradeNo}」中的${utils.building.text(info)}单位退费${utils.payment.yuan(
                    info.fee
                )}元吗？此操作不可逆，请谨慎操作`,
                onOk: () => {
                    this.refundItem(info);
                }
            });
        },
        refundQuery(info) {
            this.refundQueryItem(info);
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
        tradeNo() {
            if (!this.detail.info.created_at) {
                return '';
            }

            return moment(this.detail.info.created_at).format('YYYYMMDD') + '' + this.detail.info.order_id;
        },
        orderStatus() {
            let text = '';
            let color = '';

            if (this.detail.info.cancel) {
                text = '取消订单';
                color = 'orange';
            } else if (this.detail.info.refunding && !this.detail.info.refunded) {
                text = '退款中';
                color = 'magenta';
            } else if (this.detail.info.refunding && this.detail.info.refunded) {
                text = this.detail.info.paid_fee === 0 ? '全部退款完成' : '部分退款完成';
                color = 'red';
            } else if (this.detail.info.paid) {
                text = '已支付';
                color = 'green';
            } else if (Date.now() - this.detail.info.payExpire >= this.detail.info.created_at) {
                text = '订单超时';
                color = 'yellow';
            } else {
                text = '待支付';
                color = 'cyan';
            }

            return { text, color };
        }
    },
    components: {
        Row,
        Col,
        Tag,
        Divider,
        Empty,
        Button,
        Modal
    }
};
</script>
