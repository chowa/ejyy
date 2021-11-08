<template>
    <Card dis-hover :bordered="false" class="analysis-service-chart mt-16">
        <span slot="title">
            <Icon type="ios-people" class="icon" />
            7日内服务统计
        </span>
        <span slot="extra">
            <dl class="tabs">
                <dd :class="activeTab === 'repair' ? 'active' : ''" @click="changeTab('repair')">维修维护</dd>
                <dd :class="activeTab === 'complain' ? 'active' : ''" @click="changeTab('complain')">投诉建议</dd>
            </dl>
        </span>
        <Row>
            <Col :lg="18" :sm="18" :xs="24">
                <h4>服务统计</h4>
                <div class="service-chart" ref="chart1" />
            </Col>
            <Col :lg="6" :sm="6" :xs="24">
                <h4>服务满意度</h4>
                <div class="rate-chart" ref="chart2" />
            </Col>
        </Row>
    </Card>
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

import { Card, Icon, Row, Col } from 'view-design';
import * as echarts from 'echarts';
import moment from 'moment';

export default {
    name: 'AnalysisServiceChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    repair: [],
                    complain: []
                };
            }
        }
    },
    data() {
        return {
            activeTab: 'repair'
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.serviceChart = echarts.init(this.$refs.chart1);
            this.rateChart = echarts.init(this.$refs.chart2);
            this.drawChart();
        });

        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        this.serviceChart.dispose();
        this.rateChart.dispose();
    },
    methods: {
        onResize() {
            this.serviceChart.resize();
            this.rateChart.resize();
        },
        changeTab(activeTab) {
            this.activeTab = activeTab;
            this.drawChart();
        },
        drawChart() {
            const mom = moment().startOf('day');
            const dataAxis = [];
            const create = [];
            const allot = [];
            const dispose = [];
            const finish = [];
            const rateArr = [];

            for (let i = 6; i >= 0; i--) {
                dataAxis.push(
                    mom
                        .clone()
                        .subtract(i, 'day')
                        .format('MM月DD日')
                );
                create[i] = 0;
                allot[i] = 0;
                dispose[i] = 0;
                finish[i] = 0;
                rateArr[i] = 0;
            }

            if (Array.isArray(this.detail[this.activeTab])) {
                this.detail[this.activeTab].forEach(({ created_at, alloted_at, disposed_at, finished_at, rate }) => {
                    let index = -1;

                    if (created_at) {
                        index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                        create[index]++;
                    }

                    if (alloted_at) {
                        index = 6 - mom.diff(moment(alloted_at).startOf('day'), 'day');
                        allot[index]++;
                    }

                    if (disposed_at) {
                        index = 6 - mom.diff(moment(disposed_at).startOf('day'), 'day');
                        dispose[index]++;
                    }

                    if (finished_at) {
                        index = 6 - mom.diff(moment(finished_at).startOf('day'), 'day');
                        finish[index]++;
                    }

                    if (rate !== null) {
                        rateArr[rate]++;
                    }
                });
            }

            this.serviceChart.setOption({
                grid: {
                    top: '3%',
                    left: '5%',
                    right: '3%',
                    bottom: '8%'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderWidth: 0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                xAxis: {
                    data: dataAxis,
                    axisLabel: {
                        color: '#999'
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#f5f5f5'
                        }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: '#f5f5f5'
                        },
                        alignWithLabel: true
                    },
                    axisPointer: {
                        show: true,
                        label: {
                            show: false
                        }
                    }
                },
                yAxis: {
                    nameLocation: 'center',
                    splitNumber: 5,
                    lineStyle: {
                        color: '#f5f5f5'
                    },
                    axisLabel: {
                        color: '#999'
                    }
                },
                series: [
                    {
                        type: 'bar',
                        name: '工单上报',
                        showBackground: false,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#83bff6' },
                                { offset: 0.5, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ])
                        },
                        data: create
                    },
                    {
                        type: 'bar',
                        name: '工单指派',
                        showBackground: false,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#fd7ef6' },
                                { offset: 0.5, color: '#fb4cf1' },
                                { offset: 1, color: '#fb17ee' }
                            ])
                        },
                        data: allot
                    },
                    {
                        type: 'bar',
                        name: '工单确认',
                        showBackground: false,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#fc76a5' },
                                { offset: 0.5, color: '#fa3f81' },
                                { offset: 1, color: '#f91f6c' }
                            ])
                        },
                        data: dispose
                    },
                    {
                        type: 'bar',
                        name: '工单完成',
                        showBackground: false,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#90f786' },
                                { offset: 0.5, color: '#60f551' },
                                { offset: 1, color: '#39f726' }
                            ])
                        },
                        data: finish
                    }
                ]
            });

            const data = [
                { value: 0, name: '非常不满意' },
                { value: 0, name: '很不满意' },
                { value: 0, name: '不满意' },
                { value: 0, name: '一般满意' },
                { value: 0, name: '满意' },
                { value: 0, name: '非常满意' }
            ];

            rateArr.forEach((val, index) => {
                if (val) {
                    data[index].value += val;
                }
            });

            this.rateChart.setOption({
                series: [
                    {
                        name: '服务评价',
                        type: 'pie',
                        radius: [10, 50],
                        center: ['50%', '50%'],
                        roseType: 'area',
                        itemStyle: {
                            borderRadius: 8
                        },
                        data
                    }
                ]
            });
        }
    },
    watch: {
        detail: {
            deep: true,
            handler() {
                this.drawChart();
            }
        }
    },
    components: {
        Card,
        Icon,
        Row,
        Col
    }
};
</script>

<style lang="less">
.analysis-service-chart {
    .icon {
        width: 24px;
        height: 24px;
        line-height: 24px;
        border-radius: 50%;
        color: rgb(24, 144, 255);
        background-color: rgb(230, 247, 255);
    }

    .tabs {
        display: inline-flex;
        font-size: 12px;
        align-items: center;
        justify-content: center;
        line-height: 21px;

        dd {
            color: #999;
            cursor: pointer;

            &.active {
                color: #188df0;
            }

            + dd {
                margin-left: 8px;
            }
        }
    }

    .service-chart {
        height: 280px;
    }

    h4 {
        margin-bottom: 18px;
    }

    .rate-chart {
        height: 280px;
    }

    ul {
        list-style: none;

        li {
            line-height: 24px;
            height: 24px;
            display: flex;
            position: relative;

            span {
                width: 24px;
                height: 24px;
                line-height: 24px;
                border-radius: 50%;
                margin-right: 8px;
                display: inline-block;
                color: rgb(24, 144, 255);
                background-color: rgb(230, 247, 255);
                text-align: center;
            }

            b {
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                font-weight: 400;
            }

            + li {
                margin-top: 12px;
            }

            &:nth-child(n + 4) {
                span {
                    color: rgb(140, 140, 140);
                    background-color: rgb(245, 245, 245);
                }
            }
        }
    }
}
@media screen and (max-width: 576px) {
    .analysis-service-chart {
        .service-chart {
            margin-bottom: 18px;
        }
    }
}
</style>
