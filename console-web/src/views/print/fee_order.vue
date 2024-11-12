<template>
    <div>
        <div class="title">
            {{ community_name }}小区{{ detail.info.start_year }}年至{{ detail.info.end_year }}年物业费缴费凭证
        </div>

        <table>
            <tr>
                <td>业主姓名</td>
                <td colspan="2">{{ detail.info.real_name }}</td>
                <td>缴费时间</td>
                <td>{{ detail.info.paid_at | mom_format }}</td>
            </tr>
            <tr>
                <td>缴费方式</td>
                <td colspan="2">{{ detail.info.is_cash ? '现金' : '微信支付' }}</td>
                <td>缴费单号</td>
                <td>{{ detail.info.transaction_id }}</td>
            </tr>
            <tr>
                <td>交易单号</td>
                <td>缴费房产</td>
                <td>收费标准</td>
                <td>建筑面积</td>
                <td>金额</td>
            </tr>
            <template v-for="item in detail.items">
                <tr :key="item.id" v-if="!item.refund">
                    <td>{{ tradeNo(item.id) }}</td>
                    <td>{{ item | building }}</td>
                    <td>
                        <template v-if="item.type === 1">
                            {{ detail.info.house_fee | yuan }}元 /
                            {{ detail.info.computed_house_fee_by_area ? '平方米' : '单位' }}
                        </template>
                        <template v-else-if="item.type === 2">
                            {{ detail.info.carport_fee | yuan }}元 /
                            {{ detail.info.computed_carport_fee_by_area ? '平方米' : '单位' }}
                        </template>
                        <template v-else-if="item.type === 3">
                            {{ detail.info.warehoure_fee | yuan }}元 /
                            {{ detail.info.computed_warehouse_fee_by_area ? '平方米' : '单位' }}
                        </template>
                        <template v-else-if="item.type === 4">
                            {{ detail.info.merchant_fee | yuan }}元 /
                            {{ detail.info.computed_merchant_fee_by_area ? '平方米' : '单位' }}
                        </template>
                        <template v-else>
                            {{ detail.info.garage_fee | yuan }}元 /
                            {{ detail.info.computed_garage_fee_by_area ? '平方米' : '单位' }}
                        </template>
                    </td>
                    <td>{{ item.construction_area }}平方米</td>
                    <td>{{ item.fee | yuan }}元</td>
                </tr>
            </template>
            <tr>
                <td>总计</td>
                <td colspan="4">{{ detail.info.paid_fee | yuan }}元</td>
            </tr>
            <tr>
                <td>打印时间</td>
                <td colspan="2">{{ now | mom_format }}</td>
                <td>物业盖章</td>
                <td colspan="2"></td>
            </tr>
        </table>

        <Spin size="large" fix v-if="fetching" />
    </div>
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
import printMixin from '@/mixins/print';
import { Spin } from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'PrintFeeOrder',
    data() {
        return {
            fetching: true,
            detail: {
                info: {},
                items: []
            },
            now: Date.now()
        };
    },
    mixins: [printMixin],
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        getDetail() {
            const data = {
                order_id: this.$route.query.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/payment/order_detail', data).then(res => {
                this.fetching = false;
                this.detail = res.data;

                this.$nextTick(() => {
                    this.print();
                });
            });
        },
        tradeNo(id) {
            return `${moment(this.detail.info.created_at).format('YYYYMMDD')}${id}`;
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Spin
    }
};
</script>
