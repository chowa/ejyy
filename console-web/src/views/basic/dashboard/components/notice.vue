<template>
    <Card dis-hover :bordered="false" class="analysis-notice-chart">
        <span slot="title">
            <Icon type="ios-notifications" class="icon" />
            7日内小区通知统计
        </span>
        <div class="notice-chart" ref="chart" />
    </Card>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Card, Icon, Row, Col } from 'view-design';
import * as echarts from 'echarts';
import moment from 'moment';

export default {
    name: 'AnalysisNoticeChart',
    props: {
        detail: {
            type: Array,
            default: () => {
                return [];
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
            this.chart = echarts.init(this.$refs.chart);
            this.drawChart();
        });

        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        this.chart.dispose();
    },
    methods: {
        onResize() {
            this.chart.resize();
        },
        changeTab(activeTab) {
            this.activeTab = activeTab;
            this.drawChart();
        },
        drawChart() {
            const mom = moment().startOf('day');
            const dataAxis = [];
            const data = [];

            for (let i = 6; i >= 0; i--) {
                const label = mom
                    .clone()
                    .subtract(i, 'day')
                    .format('MM月DD日');
                dataAxis.push(label);

                data[i] = [label, 0];
            }
            if (Array.isArray(this.detail)) {
                this.detail.forEach(({ created_at }) => {
                    const cmom = moment(created_at);
                    const index = mom.diff(cmom.startOf('day'), 'day');

                    if (Array.isArray(data[index])) {
                        data[index][1]++;
                    }
                });
            }

            this.chart.setOption({
                grid: {
                    top: '3%',
                    left: '5%',
                    right: '5%',
                    bottom: '8%'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderWidth: 0,
                    textStyle: {
                        color: '#fff'
                    },
                    title: '哈哈哈'
                },
                xAxis: {
                    boundaryGap: false,
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
                    show: false
                },
                series: [
                    {
                        name: '小区通知',
                        type: 'scatter',
                        symbolSize: data => Math.pow(data[1] + data[1], 2),
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(25, 100, 150, 0.5)',
                            shadowOffsetY: 5,
                            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                                {
                                    offset: 0,
                                    color: 'rgb(129, 227, 238)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgb(25, 183, 207)'
                                }
                            ])
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
.analysis-notice-chart {
    .icon {
        width: 24px;
        height: 24px;
        line-height: 24px;
        border-radius: 50%;
        color: rgb(24, 144, 255);
        background-color: rgb(230, 247, 255);
    }
    .notice-chart {
        height: 340px;
        margin-top: 12px;
    }
}
</style>
