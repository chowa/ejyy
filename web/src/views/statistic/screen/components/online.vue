<template>
    <section class="card mr online">
        <div>
            <h4>智能物联硬件</h4>
            <h1>
                {{ thousands(total) }}
                <small>个</small>
            </h1>
        </div>
        <div ref="chart" class="chart" />
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import * as echarts from 'echarts';

export default {
    name: 'OnlineChart',
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
    data() {
        return {
            total: 0,
            error: 0
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.chart = echarts.init(this.$refs.chart);
            this.computed();
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
        thousands(num) {
            if (typeof num !== 'number') return '';
            return num.toLocaleString();
        },
        computed() {
            let total = 0;
            let error = 0;

            for (let key in this.detail) {
                if (!Array.isArray(this.detail[key])) {
                    continue;
                }

                this.detail[key].forEach(({ online }) => {
                    if (!online) {
                        error++;
                    }
                });

                total += this.detail[key].length;
            }

            this.total = total;
            this.error = error;

            this.chart.setOption({
                series: [
                    {
                        type: 'gauge',
                        startAngle: 90,
                        endAngle: -270,
                        pointer: {
                            show: false
                        },
                        zlevel: 1,
                        progress: {
                            show: true,
                            overlap: true,
                            roundCap: true,
                            clip: false,
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    {
                                        offset: 0,
                                        color: '#FF9797'
                                    },
                                    {
                                        offset: 1,
                                        color: '#F15C5C'
                                    }
                                ])
                            }
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                opacity: 0.1
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        data: [
                            {
                                value: Math.round((error / total) * 100),
                                name: '设备异常率',
                                title: {
                                    fontSize: 12,
                                    color: '#fff',
                                    offsetCenter: [0, '-10%']
                                }
                            }
                        ],
                        detail: {
                            width: 50,
                            height: 14,
                            fontSize: 16,
                            color: '#fff',
                            formatter: '{value}%',
                            offsetCenter: [0, '20%']
                        }
                    }
                ]
            });
        }
    },
    watch: {
        detail: {
            deep: true,
            handler() {
                this.computed();
            }
        }
    }
};
</script>

<style lang="less">
.online {
    flex: 0 0 20%;
    margin-bottom: 18px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 30px !important;
    white-space: nowrap;

    h4 {
        color: #fff;
        font-weight: 400;
        font-size: 0.8vw;
        line-height: 1.4vw;
    }

    h1 {
        color: #fff;
        font-size: 1.4vw;
        line-height: 1.6vw;
        font-weight: 400;
        margin-top: 1vw;

        small {
            font-size: 1vw;
        }
    }

    .chart {
        height: 100%;
        flex: auto;
        margin-left: 12px;
    }
}
</style>
