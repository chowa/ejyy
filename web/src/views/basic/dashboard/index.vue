<template>
    <section class="dashboard">
        <Row :gutter="18">
            <Col :lg="6" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" class="card">
                    <h4>小区住宅入住率</h4>

                    <div class="numeral">
                        <small>已入住</small>
                        {{ detail.house_binding_total }}
                        <small>套</small>
                    </div>

                    <div class="subinfo">
                        <Progress
                            stroke-color="#adc6ff"
                            :percent="(detail.house_binding_total / detail.house_total) * 100"
                            hide-info
                        />
                    </div>

                    <Divider />

                    <div class="statistic">
                        <span>总计</span>
                        <span>
                            {{ detail.house_total }}套，{{ detail.ower_total }}位业主，{{ detail.pet_total }}只宠物
                        </span>
                    </div>
                </Card>
            </Col>
            <Col :lg="6" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" class="card">
                    <h4>小区车位占有率</h4>

                    <div class="numeral">
                        <small>已使用</small>
                        {{ detail.carport_binding_total }}
                        <small>个</small>
                    </div>

                    <div class="subinfo">
                        <Progress
                            stroke-color="#d3adf7"
                            :percent="(detail.carport_binding_total / detail.carport_total) * 100"
                            hide-info
                        />
                    </div>

                    <Divider />

                    <div class="statistic">
                        <span>总计</span>
                        <span>{{ detail.carport_total }}个，{{ detail.car_total }}辆车</span>
                    </div>
                </Card>
            </Col>
            <Col :lg="6" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" class="card">
                    <h4>小区仓房占有率</h4>

                    <div class="numeral">
                        <small>已使用</small>
                        {{ detail.warehouse_binding_total }}
                        <small>个</small>
                    </div>

                    <div class="subinfo">
                        <Progress
                            stroke-color="#ffd591"
                            :percent="(detail.warehouse_binding_total / detail.warehouse_total) * 100"
                            hide-info
                        />
                    </div>

                    <Divider />

                    <div class="statistic">
                        <span>总计</span>
                        <span>{{ detail.warehouse_total }}个</span>
                    </div>
                </Card>
            </Col>
            <Col :lg="6" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" class="card">
                    <h4>总使用率</h4>

                    <div class="numeral">
                        <small>已关联</small>
                        {{ binding }}
                        <small>房产</small>
                    </div>

                    <div class="subinfo">
                        <Progress stroke-color="#ffadd2" :percent="percent" hide-info />
                    </div>

                    <Divider />

                    <div class="statistic">
                        <span>总计</span>
                        <span>{{ detail.house_total + detail.carport_total + detail.warehouse_total }}房产</span>
                    </div>
                </Card>
            </Col>
        </Row>

        <!-- <Row :gutter="18" class="links">
            <Col :lg="4" :sm="8" :xs="8">
                <router-link to="/repair/my">
                    <Icon type="maintain" color="rgb(255, 133, 192)" />
                    <span>维修维护</span>
                </router-link>
            </Col>
            <Col :lg="4" :sm="8" :xs="8">
                <router-link to="/complain/my">
                    <Icon type="community" color="rgb(92, 219, 211)" />
                    <span>投诉建议</span>
                </router-link>
            </Col>
            <Col :lg="4" :sm="8" :xs="8">
                <router-link to="/payment">
                    <Icon type="payment" color="rgb(255, 156, 110)" />
                    <span>许可</span>
                </router-link>
            </Col>
            <Col :lg="4" :sm="8" :xs="8">
                <router-link to="/topic">
                    <Icon type="topic" color="rgb(179, 127, 235)" />
                    <span>专题</span>
                </router-link>
            </Col>
            <Col :lg="4" :sm="8" :xs="8">
                <router-link to="/join">
                    <Icon type="apply" color="rgb(149, 222, 100)" />
                    <span>申请</span>
                </router-link>
            </Col>
            <Col :lg="4" :sm="8" :xs="8">
                <router-link to="/feedback">
                    <Icon type="feedback" color="rgb(105, 192, 255)" />
                    <span>反馈</span>
                </router-link>
            </Col>
        </Row> -->

        <AnslysisServiceChart :detail="{ repair: detail.repairList, complain: detail.complainList }" />

        <Row :gutter="18" class="mt-16">
            <Col :lg="12" :sm="12" :xs="24">
                <AnalysisRelationChart
                    :detail="{ vistor: detail.vistorList, move_car: detail.moveCarList, pet: detail.petList }"
                />
            </Col>
            <Col :lg="12" :sm="12" :xs="24">
                <AnalysisNoticeChart class="min-mt-16" :detail="detail.noticeList" />
            </Col>
        </Row>
        <Spin size="large" fix v-if="fetching" />
    </section>
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
import { Row, Col, Card, Tag, Divider, Progress, Spin, Icon } from 'view-design';
import * as utils from '@/utils';
import AnslysisServiceChart from './components/service';
import AnalysisRelationChart from './components/relation';
import AnalysisNoticeChart from './components/notice';

export default {
    name: 'BasicDashboard',
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
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/statistic/analysis', data).then(res => {
                this.fetching = false;
                this.detail = res.data;
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        binding() {
            if (this.fetching) return 0;

            return (
                this.detail.house_binding_total +
                this.detail.carport_binding_total +
                this.detail.warehouse_binding_total +
                this.detail.merchant_binding_total +
                this.detail.garage_binding_total
            );
        },
        percent() {
            return (
                ((this.detail.house_binding_total +
                    this.detail.carport_binding_total +
                    this.detail.warehouse_binding_total +
                    this.detail.merchant_binding_total +
                    this.detail.garage_binding_total) /
                    (this.detail.house_total +
                        this.detail.carport_total +
                        this.detail.warehouse_total +
                        this.detail.merchant_total +
                        this.detail.garage_total)) *
                100
            );
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Row,
        Col,
        Card,
        Tag,
        Divider,
        Spin,
        Icon,
        Progress,
        AnslysisServiceChart,
        AnalysisRelationChart,
        AnalysisNoticeChart
    }
};
</script>

<style lang="less">
.dashboard {
    .card {
        margin-bottom: 22px;

        h4 {
            font-size: 14px;
            color: #999;
            font-weight: 400;
        }

        .numeral {
            font-size: 30px;

            small {
                font-size: 16px;
            }
        }

        .subinfo {
            margin-top: 12px;
            font-size: 14px;
            color: #999;
        }

        .ivu-divider {
            margin: 12px 0;
        }

        .statistic {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    }

    .links {
        a {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff;
            border-radius: 2px;
            padding: 19px 0 14px 0;
            transition: all 0.2s;
            overflow: hidden;
            margin: 4px 0;

            &:hover {
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.13);
            }

            .ivu-icon {
                font-size: 26px;
                margin-bottom: 6px;
            }

            span {
                color: #444;
            }
        }
    }
}

@media screen and (max-width: 576px) {
    .min-mt-16 {
        margin-top: 16px;
    }
}
</style>
