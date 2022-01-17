<template>
    <Card dis-hover :bordered="false" title="收费信息">
        <Row class="detail-row">
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">小区名称</span>
                <div class="detail-content">{{ community_name }}</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">收费年份</span>
                <div class="detail-content">{{ detail.start_year }}年至{{ detail.end_year }}年</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">住宅物业费</span>
                <div class="detail-content">{{ detail.house_fee | yuan }}元</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    住宅物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.computed_house_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.computed_house_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">车位物业费</span>
                <div class="detail-content">{{ detail.carport_fee | yuan }}元</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    车位物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.computed_carport_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.computed_carport_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">仓房物业费</span>
                <div class="detail-content">{{ detail.warehoure_fee | yuan }}元</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    车位物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.computed_warehouse_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.computed_warehouse_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">商户物业费</span>
                <div class="detail-content">{{ detail.merchant_fee | yuan }}元</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    商户物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.computed_merchant_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.computed_merchant_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">车库物业费</span>
                <div class="detail-content">{{ detail.garage_fee | yuan }}元</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    车库物业费计算方式
                </span>
                <div class="detail-content">
                    <Tag :color="detail.computed_garage_fee_by_area ? 'magenta' : 'default'">
                        {{ detail.computed_garage_fee_by_area ? '建筑面积' : '单位建筑' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    微信公众号推送收费通知
                </span>
                <div class="detail-content">
                    <Tag :color="detail.wechat_push ? 'green' : 'default'">
                        {{ detail.wechat_push ? '是' : '否' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    短信推送收费通知
                </span>
                <div class="detail-content">
                    <Tag :color="detail.sms_push ? 'green' : 'default'">
                        {{ detail.sms_push ? '是' : '否' }}
                    </Tag>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">
                    收费创建人
                </span>
                <div class="detail-content">
                    <router-link :to="`/oa/hr/colleague/detail/${detail.created_by}`">
                        {{ detail.real_name }}
                    </router-link>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <span class="detail-label">创建时间</span>
                <div class="detail-content">{{ detail.created_at | mom_format }}</div>
            </Col>
        </Row>

        <Spin size="large" fix v-if="fetching" />
    </Card>
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag } from 'view-design';
import * as utils from '@/utils';

export default {
    name: 'FinanceFeeDetail',
    data() {
        return {
            fetching: true,
            detail: {}
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/payment/detail', data).then(res => {
                this.fetching = false;
                this.detail = res.data;
                this.$emit('on-fee-load', res.data);
            });
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
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Card,
        Spin,
        Row,
        Col,
        Tag
    }
};
</script>
