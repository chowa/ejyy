<template>
    <section class="card mr iot">
        <h2 class="card-title">7日内智能物联工作情况</h2>
        <div ref="chart" class="chart" />
    </section>
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

import * as echarts from 'echarts';
import moment from 'moment';

export default {
    name: 'IotChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    entrance: [],
                    elevator: [],
                    lamp: [],
                    repeater: [],
                    park: [],
                    warning: []
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
            const mom = moment().startOf('day');
            const dataAxis = [];
            const entrance = [];
            const elevator = [];
            const lamp = [];
            const repeater = [];
            const park = [];
            const warning = [];

            for (let i = 6; i >= 0; i--) {
                dataAxis.push(
                    mom
                        .clone()
                        .subtract(i, 'day')
                        .format('MM月DD日')
                );
                entrance[i] = 0;
                elevator[i] = 0;
                lamp[i] = 0;
                repeater[i] = 0;
                park[i] = 0;
                warning[i] = 0;
            }

            this.detail.entrance.forEach(({ created_at }) => {
                const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                entrance[index]++;
            });

            this.detail.elevator.forEach(({ created_at }) => {
                const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                elevator[index]++;
            });

            this.detail.lamp.forEach(({ created_at }) => {
                const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                lamp[index]++;
            });

            this.detail.repeater.forEach(({ created_at }) => {
                const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                repeater[index]++;
            });

            this.detail.park.forEach(({ created_at }) => {
                const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                park[index]++;
            });

            this.detail.warning.forEach(({ created_at }) => {
                const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                warning[index]++;
            });

            this.chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderColor: '#2b2b2b',
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: {
                    left: '8%',
                    right: '6%',
                    bottom: '5%'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: dataAxis,
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
                        name: '智能门禁',
                        type: 'line',
                        smooth: true,
                        data: entrance,
                        lineStyle: {
                            width: 2,
                            color: '#eb2f96'
                        }
                    },
                    {
                        name: '智能梯控',
                        type: 'line',
                        smooth: true,
                        data: elevator,
                        lineStyle: {
                            width: 2,
                            color: '#1890ff'
                        }
                    },
                    {
                        name: '智慧照明',
                        type: 'line',
                        smooth: true,
                        data: lamp,
                        lineStyle: {
                            width: 2,
                            color: '#13c2c2'
                        }
                    },
                    {
                        name: '能耗管理',
                        type: 'line',
                        smooth: true,
                        data: repeater,
                        lineStyle: {
                            width: 2,
                            color: '#52c41a'
                        }
                    },
                    {
                        name: '智慧停车',
                        type: 'line',
                        smooth: true,
                        data: park,
                        lineStyle: {
                            width: 2,
                            color: '#722ed1'
                        }
                    },
                    {
                        name: '智慧预警',
                        type: 'line',
                        smooth: true,
                        data: warning,
                        lineStyle: {
                            width: 2,
                            color: '#ed4014'
                        }
                    }
                ]
            });

            setTimeout(() => {
                this.onResize();
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
    }
};
</script>

<style lang="less">
.iot {
    flex: auto;

    .chart {
        width: 100%;
        height: 100%;
        max-height: 45.13vh;
        margin-top: -2.3vw;
    }
}
</style>
