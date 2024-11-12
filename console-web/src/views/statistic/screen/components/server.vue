<template>
    <section class="card mr server">
        <h2 class="card-title">服务器实时状态</h2>
        <div ref="chart" class="chart" />
    </section>
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

import * as echarts from 'echarts';

export default {
    name: 'ServerChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    cpu: 0,
                    mem: 0,
                    disk: 0
                };
            }
        }
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
        drawChart() {
            this.chart.setOption({
                series: [
                    {
                        type: 'gauge',
                        center: ['16%', '54%'],
                        radius: '48%',
                        axisLine: {
                            lineStyle: {
                                width: 10,
                                color: [
                                    [0.25, '#7CFFB2'],
                                    [0.5, '#58D9F9'],
                                    [0.75, '#FDDD60'],
                                    [1, '#FF6E76']
                                ]
                            }
                        },
                        pointer: {
                            itemStyle: {
                                color: 'inherit'
                            }
                        },
                        axisTick: {
                            distance: -10,
                            length: 6,
                            lineStyle: {
                                color: '#fff',
                                width: 1
                            }
                        },
                        splitLine: {
                            distance: -10,
                            length: 10,
                            lineStyle: {
                                color: '#fff',
                                width: 2
                            }
                        },
                        axisLabel: {
                            color: 'inherit',
                            distance: 14,
                            fontSize: 12
                        },
                        detail: {
                            valueAnimation: true,
                            formatter: '{value} %',
                            color: 'inherit',
                            fontSize: 14,
                            lineHeight: 18
                        },
                        title: {
                            show: true,
                            fontSize: 14,
                            offsetCenter: [0, '100%'],
                            color: '#fff'
                        },
                        data: [
                            {
                                name: '硬盘使用率',
                                value: this.detail.disk
                            }
                        ]
                    },
                    {
                        type: 'gauge',
                        center: ['49%', '54%'],
                        radius: '48%',
                        axisLine: {
                            lineStyle: {
                                width: 10,
                                color: [
                                    [0.25, '#7CFFB2'],
                                    [0.5, '#58D9F9'],
                                    [0.75, '#FDDD60'],
                                    [1, '#FF6E76']
                                ]
                            }
                        },
                        pointer: {
                            itemStyle: {
                                color: 'inherit'
                            }
                        },
                        axisTick: {
                            distance: -10,
                            length: 6,
                            lineStyle: {
                                color: '#fff',
                                width: 1
                            }
                        },
                        splitLine: {
                            distance: -10,
                            length: 10,
                            lineStyle: {
                                color: '#fff',
                                width: 2
                            }
                        },
                        axisLabel: {
                            color: 'inherit',
                            distance: 14,
                            fontSize: 12
                        },
                        detail: {
                            valueAnimation: true,
                            formatter: '{value} %',
                            color: 'inherit',
                            fontSize: 14,
                            lineHeight: 18
                        },
                        title: {
                            show: true,
                            fontSize: 14,
                            offsetCenter: [0, '100%'],
                            color: '#fff'
                        },
                        data: [
                            {
                                name: '内存使用率',
                                value: this.detail.mem
                            }
                        ]
                    },
                    {
                        type: 'gauge',
                        center: ['82%', '54%'],
                        radius: '48%',
                        axisLine: {
                            lineStyle: {
                                width: 10,
                                color: [
                                    [0.25, '#7CFFB2'],
                                    [0.5, '#58D9F9'],
                                    [0.75, '#FDDD60'],
                                    [1, '#FF6E76']
                                ]
                            }
                        },
                        pointer: {
                            itemStyle: {
                                color: 'inherit'
                            }
                        },
                        axisTick: {
                            distance: -10,
                            length: 6,
                            lineStyle: {
                                color: '#fff',
                                width: 1
                            }
                        },
                        splitLine: {
                            distance: -10,
                            length: 10,
                            lineStyle: {
                                color: '#fff',
                                width: 2
                            }
                        },
                        axisLabel: {
                            color: 'inherit',
                            distance: 14,
                            fontSize: 12
                        },
                        detail: {
                            valueAnimation: true,
                            formatter: '{value} %',
                            color: 'inherit',
                            fontSize: 14,
                            lineHeight: 18
                        },
                        title: {
                            show: true,
                            fontSize: 14,
                            offsetCenter: [0, '100%'],
                            color: '#fff'
                        },
                        data: [
                            {
                                name: '处理器使用率',
                                value: this.detail.cpu
                            }
                        ]
                    }
                ]
            });
        }
    },
    watch: {
        detail: {
            deep: true,
            handler(cur) {
                this.chart.setOption({
                    series: [
                        {
                            data: [{ name: '硬盘使用率', value: cur.disk }]
                        },
                        {
                            data: [{ name: '内存使用率', value: cur.mem }]
                        },
                        {
                            data: [{ name: '处理器使用率', value: cur.cpu }]
                        }
                    ]
                });
            }
        }
    }
};
</script>

<style lang="less">
.server {
    flex: 0 0 26%;
    margin-bottom: 16px;

    .chart {
        width: 100%;
        height: 100%;
        margin-top: -2.3vw;
    }
}
</style>
