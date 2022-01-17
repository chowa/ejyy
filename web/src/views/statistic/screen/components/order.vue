<template>
    <section class="card mr order">
        <h2 class="card-title">今日工单统计情况</h2>
        <Row>
            <Col :span="13">
                <div ref="barChart" class="chart" />
            </Col>
            <Col :span="11">
                <div ref="radarChart" class="chart" />
            </Col>
        </Row>
    </section>
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

import { Row, Col } from 'view-design';
import * as echarts from 'echarts';

export default {
    name: 'OrderChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    repair_current_day: [],
                    complain_current_day: []
                };
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.barChart = echarts.init(this.$refs.barChart);
            this.radarChart = echarts.init(this.$refs.radarChart);
            this.drawChart();
        });

        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        this.barChart.dispose();
        this.radarChart.dispose();
    },
    methods: {
        onResize() {
            this.barChart.resize();
            this.radarChart.resize();
        },
        drawChart() {
            const { repair_current_day, complain_current_day } = this.detail;
            const repair_data = [0, 0, 0, 0, 0];
            const repair_rate = [0, 0, 0, 0, 0, 0];
            const complain_data = [0, 0, 0, 0, 0];
            const complain_rate = [];

            repair_current_day.forEach(record => {
                if (record.merge_id) {
                    repair_data[4]++;
                } else if (record.step === 4) {
                    if (record.rate !== null) {
                        repair_rate[record.rate]++;
                    } else {
                        repair_data[3]++;
                    }
                } else if (record.step === 3) {
                    repair_data[2]++;
                } else if (record.step === 2) {
                    repair_data[1]++;
                } else if (record.step === 1) {
                    repair_data[0]++;
                }
            });

            complain_current_day.forEach(record => {
                if (record.merge_id) {
                    complain_data[4]++;
                } else if (record.step === 4) {
                    if (record.rate !== null) {
                        complain_rate[record.rate]++;
                    } else {
                        complain_data[3]++;
                    }
                } else if (record.step === 3) {
                    complain_data[2]++;
                } else if (record.step === 2) {
                    complain_data[1]++;
                } else if (record.step === 1) {
                    complain_data[0]++;
                }
            });

            this.barChart.setOption({
                grid: {
                    left: '6%',
                    right: '4%',
                    bottom: '6%'
                },
                xAxis: {
                    type: 'category',
                    data: ['待指派', '待确认', '待执行', '待评价', '合并工单'],
                    axisLabel: {
                        color: '#8596a5'
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#8596a5'
                        }
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: '#8596a5'
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#8596a5'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(38, 43, 85)'
                        }
                    }
                },
                series: [
                    {
                        name: '维修工单',
                        type: 'bar',
                        barGap: 0,
                        color: '#5570cb',
                        emphasis: {
                            focus: 'series'
                        },
                        data: repair_data
                    },
                    {
                        name: '投诉工单',
                        type: 'bar',
                        color: '#55c6f7',
                        emphasis: {
                            focus: 'series'
                        },
                        data: complain_data
                    }
                ]
            });

            this.radarChart.setOption({
                radar: [
                    {
                        indicator: [
                            {
                                text: '非常不满意'
                            },
                            {
                                text: '很不满意'
                            },
                            {
                                text: '不满意'
                            },
                            {
                                text: '一般满意'
                            },
                            {
                                text: '满意'
                            },
                            {
                                text: '非常满意'
                            }
                        ],
                        radius: 120,
                        axisName: {
                            color: '#fff',
                            borderRadius: 3,
                            padding: [3, 5]
                        }
                    }
                ],
                series: [
                    {
                        type: 'radar',
                        data: [
                            {
                                value: repair_rate,
                                symbol: 'rect',
                                symbolSize: 12,
                                lineStyle: {
                                    type: 'dashed'
                                }
                            },
                            {
                                value: complain_rate,
                                areaStyle: {
                                    color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                                        {
                                            color: 'rgba(255, 145, 124, 0.1)',
                                            offset: 0
                                        },
                                        {
                                            color: 'rgba(255, 145, 124, 0.9)',
                                            offset: 1
                                        }
                                    ])
                                }
                            }
                        ]
                    }
                ]
            });

            setTimeout(() => {
                this.onResize();
            });
        }
    },
    components: {
        Row,
        Col
    },
    watch: {
        detail: {
            deep: true,
            handler() {
                this.drawChart();
            }
        }
    }
};
</script>

<style lang="less">
.order {
    flex: auto;

    .ivu-row {
        width: 100%;
        height: 100%;
        margin-top: -2.3vw;

        .chart {
            width: 100%;
            height: 100%;
            max-height: 29.72vh;
        }
    }
}
</style>
