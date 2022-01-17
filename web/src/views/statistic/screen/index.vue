<template>
    <section class="big-screen">
        <div class="big-screen-header">
            <div class="big-screen-header-wrapper">
                <img src="../../../assets/screen/header.png" class="big-screen-header-bg" />

                <img src="../../../assets/screen/reading.png" class="big-screen-header-reading" />

                <div class="big-screen-header-title">
                    <img src="../../../assets/screen/title.png" class="big-screen-header-title-bg" />

                    <img src="../../../assets/chowa.svg" class="big-screen-header-title-logo" />

                    <div class="text">
                        <b>{{ community_name }}小区 — 智慧物业调度与统计中心</b>
                        <p>助力物业服务升级，用心服务万千业主 —— 卓瓦科技</p>
                    </div>
                </div>

                <div class="big-screen-header-total">
                    <Row>
                        <Col :span="8">
                            <Icon type="maintain" />
                            <div>
                                <h5>累计受理维修工单</h5>
                                <p>
                                    {{ thousands(detail.repair_total) }}
                                    <small>次</small>
                                </p>
                            </div>
                        </Col>
                        <Col :span="8">
                            <Icon type="report" />
                            <div>
                                <h5>累计响应投诉建议</h5>
                                <p>
                                    {{ thousands(detail.complain_total) }}
                                    <small>次</small>
                                </p>
                            </div>
                        </Col>
                        <Col :span="8">
                            <Icon type="movecar" />
                            <div>
                                <h5>累计帮助业主挪车</h5>
                                <p>
                                    {{ thousands(detail.movecar_total) }}
                                    <small>次</small>
                                </p>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>

        <div class="big-screen-body">
            <div class="left">
                <Row :gutter="12" class="total-wrapper">
                    <Col :span="6">
                        <div class="card total">
                            <img src="../../../assets/screen/building.png" class="item" />
                            <img src="../../../assets/screen/staring.png" class="star" />

                            <h5>{{ thousands(detail.building_total) }}</h5>
                            <p>小区房产</p>

                            <img src="../../../assets/screen/moring.png" class="moring" />
                        </div>
                    </Col>
                    <Col :span="6">
                        <div class="card total">
                            <img src="../../../assets/screen/ower.png" class="item" />
                            <img src="../../../assets/screen/staring.png" class="star" />

                            <h5>{{ thousands(detail.ower_total) }}</h5>
                            <p>注册业主</p>

                            <img src="../../../assets/screen/moring.png" class="moring" />
                        </div>
                    </Col>
                    <Col :span="6">
                        <div class="card total">
                            <img src="../../../assets/screen/car.png" class="item" />
                            <img src="../../../assets/screen/staring.png" class="star" />

                            <h5>{{ thousands(detail.car_total) }}</h5>
                            <p>小区车辆</p>

                            <img src="../../../assets/screen/moring.png" class="moring" />
                        </div>
                    </Col>
                    <Col :span="6">
                        <div class="card total">
                            <img src="../../../assets/screen/pet.png" class="item" />
                            <img src="../../../assets/screen/staring.png" class="star" />

                            <h5>{{ thousands(detail.pet_total) }}</h5>
                            <p>小区宠物</p>

                            <img src="../../../assets/screen/moring.png" class="moring" />
                        </div>
                    </Col>
                </Row>

                <ServerChart :detail="{ cpu: detail.cpu, mem: detail.mem, disk: detail.disk }" />

                <IotChart :detail="detail.log" />
            </div>

            <div class="center">
                <MapChart :detail="detail.iot" :log="detail.log" />
                <OrderChart :detail="detail.order" />
            </div>

            <div class="right">
                <EntranceChart :detail="detail.current" />

                <WarningChart :detail="detail.warning_current" />

                <OnlineChart :detail="detail.iot" />

                <NoticeChart :detail="detail.notice" />
            </div>
        </div>

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
import { Row, Col, Icon, Spin } from 'view-design';
import ServerChart from './components/server';
import IotChart from './components/iot';
import MapChart from './components/map';
import OrderChart from './components/order';
import EntranceChart from './components/entrance';
import WarningChart from './components/warning';
import NoticeChart from './components/notice';
import OnlineChart from './components/online';
import * as utils from '@/utils';

export default {
    name: 'StatisticScreen',
    data() {
        return {
            fetching: true,
            detail: {
                building_total: 0,
                ower_total: 0,
                car_total: 0,
                pet_total: 0,
                repair_total: 0,
                complain_total: 0,
                movecar_total: 0,
                cpu: 0,
                mem: 0,
                disk: 0,
                log: {
                    entrance: [],
                    elevator: [],
                    lamp: [],
                    repeater: [],
                    park: [],
                    warning: []
                },
                iot: {
                    center: {},
                    entrance: [],
                    elevator: [],
                    lamp: [],
                    repeater: [],
                    park: [],
                    warning: []
                },
                current: {
                    entrance_current_day_log: [],
                    elevator_current_day_log: [],
                    park_current_day_log: []
                },
                order: {
                    repair_current_day: [],
                    complain_current_day: []
                },
                warning_current: [],
                notice: {}
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();

            this.timer = setInterval(() => {
                this.getDetail();
            }, 60000);
        }
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        getDetail() {
            const data = {
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/statistic/screen', data)
                .then(res => {
                    this.detail = res.data;
                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        thousands(num) {
            if (typeof num !== 'number') return '';
            return num.toLocaleString();
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
        Row,
        Col,
        Icon,
        Spin,
        ServerChart,
        IotChart,
        MapChart,
        OrderChart,
        EntranceChart,
        WarningChart,
        NoticeChart,
        OnlineChart
    }
};
</script>

<style lang="less">
.big-screen {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background: #2b315c;
    display: flex;
    flex-direction: column;

    &-header {
        width: 100%;
        flex: none;
        padding: 12px;
        position: relative;

        &-wrapper {
            position: relative;
            overflow: hidden;
        }

        &-bg {
            width: 100%;
            position: relative;
            z-index: 1;
        }

        &-reading {
            position: absolute;
            z-index: 2;
            bottom: 0;
            left: 37.82%;
            width: 1.6vw;
        }

        &-title {
            width: 42.78%;
            height: 77.14%;
            overflow: hidden;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 2;
            padding: 16px;
            display: flex;
            flex-direction: row;
            align-items: center;

            &-bg {
                position: absolute;
                top: -25%;
                right: -10%;
                max-width: none;
                height: 200%;
                width: 200%;
            }

            &-logo {
                height: 100%;
                margin-right: 14px;
                flex: none;
            }

            .text {
                line-height: 1;
                position: relative;
                z-index: 5;
            }

            b {
                font-size: 1.4vw;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                background-image: linear-gradient(
                    0deg,
                    rgb(147, 229, 255) 0%,
                    rgb(255, 255, 255) 100%,
                    rgb(255, 255, 255) 13%
                );
            }

            p {
                font-size: 0.8vw;
                color: #fff;
                margin-top: 0.6vw;
            }
        }

        &-total {
            width: 57%;
            position: absolute;
            top: 6.8%;
            right: 0;
            bottom: 12px;
            z-index: 5;

            .ivu-row {
                height: 100%;
            }

            .ivu-col {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 12px 12px 0;
            }

            .ivu-icon {
                font-size: 1.5vw;
                color: #fff;
                margin-right: 1vw;
                margin-bottom: 0.8vw;
            }

            h5 {
                color: #fff;
                font-size: 1vw;
                font-weight: 500;
                line-height: 1;
                margin-bottom: 0.3vw;
            }

            p {
                color: #fff;
                font-size: 1.4vw;

                small {
                    font-size: 1vw;
                    margin-left: 0.2vw;
                }
            }
        }
    }

    &-body {
        padding: 0 12px 12px;
        overflow: hidden;
        flex: auto;
        display: flex;
        flex-direction: row;

        .left {
            margin-right: 18px;
            flex: 0 0 26%;
            overflow: hidden;
            display: flex;
            flex-direction: column;

            .total-wrapper {
                flex: none;
                margin-bottom: 18px;

                .total {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;

                    .item {
                        width: 8vw;
                    }

                    .star {
                        position: absolute;
                        top: 4px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 8vw;
                    }

                    h5 {
                        text-align: center;
                        font-size: 1vw;
                        font-weight: 500;
                        line-height: 1;
                        color: #fff;
                        margin-bottom: 0.2vw;
                    }

                    p {
                        text-align: center;
                        line-height: 1;
                        color: #fff;
                        font-size: 0.6vw;
                    }

                    .moring {
                        width: 6vw;
                        margin-top: -2vw;
                        margin-bottom: -1.5vw;
                    }
                }
            }
        }

        .center {
            flex: auto;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .right {
            flex: 0 0 26%;
            margin-left: 18px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .card {
            background-image: linear-gradient(rgb(57, 65, 120) 0%, rgb(38, 43, 85) 100%);
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            padding: 8px 6px;

            &-title {
                color: #fff;
                line-height: 1.5vw;
                font-size: 0.8vw;
                font-weight: 400;
                margin-bottom: 0.8vw;
            }

            &.mr {
                padding: 16px 18px;
            }
        }
    }
}
</style>
