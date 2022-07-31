<template>
    <div>
        <div class="title">物业费缴费通知</div>

        <p class="to">尊敬的各位业主：</p>

        <p class="section">
            为维护小区正常秩序、保障环境卫生，维护公共配套设施，{{ community_name }}小区{{ detail.start_year }}年至{{
                detail.end_year
            }}年物业费已开始缴费。如果物业费不能按时缴纳，将会对物业服务工作造成不利影响，同时也侵犯了已交费业主的利益。
        </p>
        <p class="section">本年度物业费收费标准如下：</p>

        <ul>
            <li>
                住宅物业费：{{ detail.house_fee | yuan }}元 /
                {{ detail.computed_house_fee_by_area ? '平方米' : '单位' }}
            </li>
            <li>
                商户物业费：{{ detail.merchant_fee | yuan }}元 /
                {{ detail.computed_merchant_fee_by_area ? '平方米' : '单位' }}
            </li>
            <li>
                车位物业费：{{ detail.carport_fee | yuan }}元 /
                {{ detail.computed_carport_fee_by_area ? '平方米' : '单位' }}
            </li>
            <li>
                车库物业费：{{ detail.garage_fee | yuan }}元 /
                {{ detail.computed_garage_fee_by_area ? '平方米' : '单位' }}
            </li>
            <li>
                仓房物业费：{{ detail.warehoure_fee | yuan }}元 /
                {{ detail.computed_warehouse_fee_by_area ? '平方米' : '单位' }}
            </li>
        </ul>

        <p class="section">您可前往物业办公室现场缴费，或扫描下方二维码通过业主小程序缴费。</p>
        <img src="~@/assets/help/ump/qrcode.jpg" @load="imgLoaded" width="215" />

        <p class="date">{{ detail.created_at | mom_format }}</p>
        <Spin size="large" fix v-if="fetching" />
    </div>
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import printMixin from '@/mixins/print';
import { Spin } from 'view-design';
import * as utils from '@/utils';

export default {
    name: 'PrintFeeNotice',
    data() {
        return {
            fetching: true,
            detail: {
                house_fee: 0,
                merchant_fee: 0,
                carport_fee: 0,
                garage_fee: 0,
                warehoure_fee: 0
            },
            loaded: false
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
                id: this.$route.query.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/payment/detail', data).then(res => {
                this.fetching = false;
                this.detail = res.data;

                this.callPrint();
            });
        },
        imgLoaded() {
            this.loaded = true;
            this.callPrint();
        },
        callPrint() {
            if (!this.loaded || this.fetching) return;

            this.$nextTick(() => {
                this.print();
            });
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
