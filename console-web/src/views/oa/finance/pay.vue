<template>
    <WaterMark>
        <Header back />

        <FeeDetail @on-fee-load="onFeeLoad" />

        <Card dis-hover :bordered="false" class="mt-16">
            <Steps :current="step">
                <Step title="业主信息" content="确认业主信息" />
                <Step title="费用详细" content="确认物业费用详细" />
                <Step title="缴费成功" content="物业费现场缴费成功" />
            </Steps>

            <FindOwer v-if="step === 0" @on-find-owner="onFindOwer" />

            <div v-if="step === 1" class="ivu-form">
                <template v-if="list.length === 0">
                    <Alert type="success" show-icon>
                        业主{{ ownerInfo.real_name }}名下房产物业费用已缴清，请勿重复付款。
                        <p slot="desc">
                            平台按照房产信息判断是否收取物业费用，多位业主同时绑定同一房产时仅允许其中一位业主支付物业费。
                        </p>
                    </Alert>
                </template>
                <template v-else>
                    <ul class="fee-detail">
                        <li>
                            <div>
                                业主姓名
                            </div>
                            <div>
                                {{ ownerInfo.real_name }}
                            </div>
                        </li>
                        <li v-for="(item, key) in list" :key="item.building_id">
                            <div>
                                <span>{{ key + 1 }}</span>
                                {{ item | building }}
                            </div>
                            <div>
                                {{ computedItemFee(item) }}
                            </div>
                        </li>
                        <li class="right">总计：{{ total }}元</li>
                    </ul>
                    <div class="cw-form-actions">
                        <Button @click="preStep">上一步</Button>
                        <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                    </div>
                </template>
            </div>

            <Result title="物业费现场缴费成功" v-if="step === 2">
                <div slot="actions">
                    <Button @click="goOrderList" type="primary">查看已缴费订单</Button>
                </div>
            </Result>

            <Spin size="large" fix v-if="fetching" />
        </Card>
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
import { Card, Steps, Step, Spin, Button, Alert } from 'view-design';
import { Header, WaterMark, FindOwer, Result } from '@/components';
import FeeDetail from './components/fee-detail';
import * as utils from '@/utils';

export default {
    name: 'OaFinancePay',
    data() {
        return {
            step: 0,
            ownerInfo: {},
            fee: {},
            list: [],
            fetching: false,
            submiting: false
        };
    },
    methods: {
        onFeeLoad(data) {
            this.fee = data;
        },
        onFindOwer(info) {
            this.ownerInfo = info;
            this.step++;
            this.fetching = true;

            const data = {
                community_id: this.postInfo.default_community_id,
                property_fee_id: this.$route.params.id,
                user_id: info.id
            };

            utils.request
                .post('/payment/prepay', data)
                .then(res => {
                    this.fetching = false;
                    this.list = res.data.list;
                })
                .catch(() => (this.fetching = false));
        },
        preStep() {
            this.step--;
        },
        computedItemFee(info) {
            let fen;
            let computed_by_area;

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
                return `收取年度物业费${utils.payment.yuan(fen)}元`;
            }

            return `建筑面积${info.construction_area}㎡，每平米收取${utils.payment.yuan(
                fen
            )}元，总计：${utils.payment.yuan(Math.floor(info.construction_area * fen))}元`;
        },
        submit() {
            this.submiting = true;

            const data = {
                building_ids: this.list.map(item => item.building_id),
                community_id: this.postInfo.default_community_id,
                property_fee_id: this.$route.params.id,
                user_id: this.ownerInfo.id
            };

            utils.request
                .post('/payment/pay', data)
                .then(() => {
                    this.submiting = false;
                    this.step++;
                })
                .catch(() => (this.submiting = false));
        },
        goOrderList() {
            this.$router.push(`/oa/finance/order/${this.$route.params.id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        total() {
            let ret = 0;

            this.list.forEach(item => {
                let fen;
                let computed_by_area;

                if (item.type === 1) {
                    fen = this.fee.house_fee;
                    computed_by_area = this.fee.computed_house_fee_by_area;
                } else if (item.type === 2) {
                    fen = this.fee.carport_fee;
                    computed_by_area = this.fee.computed_carport_fee_by_area;
                } else if (item.type === 3) {
                    fen = this.fee.warehoure_fee;
                    computed_by_area = this.fee.computed_warehouse_fee_by_area;
                } else if (item.type === 4) {
                    fen = this.fee.merchant_fee;
                    computed_by_area = this.fee.computed_merchant_fee_by_area;
                } else if (item.type === 5) {
                    fen = this.fee.garage_fee;
                    computed_by_area = this.fee.computed_garage_fee_by_area;
                }

                if (!computed_by_area) {
                    ret += Math.floor(fen);
                } else {
                    ret += Math.floor(item.construction_area * fen);
                }
            });

            return utils.payment.yuan(ret);
        }
    },
    components: {
        Card,
        Header,
        FeeDetail,
        WaterMark,
        Steps,
        Step,
        FindOwer,
        Spin,
        Button,
        Alert,
        Result
    }
};
</script>

<style lang="less">
.fee-detail {
    list-style: none;

    li {
        line-height: 46px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        &.right {
            justify-content: flex-end;
        }

        + li {
            border-top: 1px dashed #f5f5f5;
        }
    }
}
</style>
