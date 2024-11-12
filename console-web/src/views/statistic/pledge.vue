<template>
    <WaterMark>
        <Header />

        <Row :gutter="22">
            <Col :span="8">
                <Card dis-hover :bordered="false" class="mt-16" title="收取保证金">
                    <h2 class="total-fee green">
                        {{ chart.type[0] | yuan }}
                        <small>元</small>
                    </h2>
                </Card>
            </Col>
            <Col :span="8">
                <Card dis-hover :bordered="false" class="mt-16" title="退还保证金">
                    <h2 class="total-fee red">
                        {{ chart.type[0] | yuan }}
                        <small>元</small>
                    </h2>
                </Card>
            </Col>
            <Col :span="8">
                <Card dis-hover :bordered="false" class="mt-16" title="退还比例">
                    <div class="return-chart" ref="chart2" />
                </Card>
            </Col>
        </Row>

        <Card dis-hover :bordered="false" class="mt-16" title="押金统计">
            <div class="cash-chart" ref="chart1" />
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';
import moment from 'moment';
import * as echarts from 'echarts';

export default {
    name: 'StatisticFitment',
    data() {
        return {
            fetching: true,
            chart: {
                type: [0, 0],
                line: []
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }

        this.$nextTick(() => {
            this.cashChart = echarts.init(this.$refs.chart1);
            this.returnChart = echarts.init(this.$refs.chart2);
        });

        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        this.cashChart.dispose();
        this.returnChart.dispose();
    },
    methods: {
        onResize() {
            this.cashChart.resize();
            this.returnChart.resize();
        },
        getDetail() {
            const { postInfo } = this;

            utils.request
                .post('/statistic/fitment', {
                    community_id: postInfo.default_community_id
                })
                .then(res => {
                    const line = [];
                    const type = [0, 0];

                    res.data.list.forEach(({ cash_deposit, is_return_cash_deposit, created_at }) => {
                        if (!cash_deposit) {
                            line.push([moment(created_at).format('YYYY-MM-DD'), 0]);
                        } else {
                            type[0] += cash_deposit;
                            type[1] += is_return_cash_deposit ? cash_deposit : 0;
                            line.push([moment(created_at).format('YYYY-MM-DD'), utils.payment.yuan(cash_deposit)]);
                        }
                    });

                    this.chart = {
                        type,
                        line
                    };
                    this.drawChart();

                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        drawChart() {
            const { line, type } = this.chart;

            this.cashChart.setOption({
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
                    data: line.map(item => item[0]),
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
                        type: 'line',
                        showSymbol: false,
                        data: line.map(item => item[1])
                    }
                ]
            });

            this.returnChart.setOption({
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        name: '退还比例',
                        type: 'pie',
                        radius: [10, 50],
                        center: ['50%', '50%'],
                        roseType: 'area',
                        itemStyle: {
                            borderRadius: 8
                        },
                        data: [
                            {
                                name: '收取费用',
                                value: utils.payment.yuan(type[0])
                            },
                            {
                                name: '退费费用',
                                value: utils.payment.yuan(type[1])
                            }
                        ]
                    }
                ]
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Header,
        Card,
        WaterMark,
        Spin,
        Row,
        Col
    }
};
</script>

<style lang="less">
.total-fee {
    height: 24vh;
    line-height: 24vh;
    font-size: 62px;
    text-align: center;
    font-weight: 400;

    small {
        font-size: 16px;
        margin-left: 8px;
    }

    &.green {
        color: #30b08f;
    }

    &.red {
        color: #f6416c;
    }
}

.cash-chart {
    height: 32vh;
}

.return-chart {
    height: 24vh;
}
</style>
