<template>
    <Card dis-hover :bordered="false" class="analysis-relation-chart">
        <span slot="title">
            <Icon type="md-analytics" class="icon" />
            7日内访客、宠物、挪车统计
        </span>
        <div class="realiton-chart" ref="chart" />
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

import { Card, Icon, Row, Col } from 'view-design';
import * as echarts from 'echarts';
import moment from 'moment';

export default {
    name: 'AnalysisRelationChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    vistor: [],
                    move_car: [],
                    pet: []
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
            const pet = [];
            const move_car = [];
            const vistor = [];

            for (let i = 6; i >= 0; i--) {
                dataAxis.push(
                    mom
                        .clone()
                        .subtract(i, 'day')
                        .format('MM月DD日')
                );
                pet[i] = 0;
                move_car[i] = 0;
                vistor[i] = 0;
            }

            if (Array.isArray(this.detail.pet)) {
                this.detail.pet.forEach(({ created_at }) => {
                    const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                    pet[index]++;
                });
            }

            if (Array.isArray(this.detail.move_car)) {
                this.detail.move_car.forEach(({ created_at }) => {
                    const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                    move_car[index]++;
                });
            }

            if (Array.isArray(this.detail.vistor)) {
                this.detail.vistor.forEach(({ created_at }) => {
                    const index = 6 - mom.diff(moment(created_at).startOf('day'), 'day');
                    vistor[index]++;
                });
            }

            this.chart.setOption({
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
                        name: '小区挪车',
                        type: 'line',
                        stack: '总量',
                        areaStyle: {},
                        emphasis: {
                            focus: 'series'
                        },
                        data: move_car
                    },
                    {
                        name: '宠物登记',
                        type: 'line',
                        stack: '总量',
                        areaStyle: {},
                        emphasis: {
                            focus: 'series'
                        },
                        data: pet
                    },
                    {
                        name: '访客登记',
                        type: 'line',
                        stack: '总量',
                        areaStyle: {},
                        emphasis: {
                            focus: 'series'
                        },
                        data: vistor
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
.analysis-relation-chart {
    .icon {
        width: 24px;
        height: 24px;
        line-height: 24px;
        border-radius: 50%;
        color: rgb(24, 144, 255);
        background-color: rgb(230, 247, 255);
    }
    .realiton-chart {
        height: 340px;
        margin-top: 12px;
    }
}
</style>
