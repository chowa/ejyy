<template>
    <WaterMark>
        <Header />

        <div>
            <DatePicker
                format="yyyy年MM月dd日"
                :value="new Date(start_date)"
                @on-change="onStartDateChange"
                placeholder="请选择开始时间"
            />

            <span class="ml-12">至</span>

            <DatePicker
                format="yyyy年MM月dd日"
                :value="new Date(end_date)"
                @on-change="onEndDateChange"
                placeholder="请选择结束时间"
                class="ml-12"
            />

            <Button type="primary" @click="getDetail" class="ml-12">查询</Button>
        </div>

        <Row :gutter="22">
            <Col :span="8">
                <Card dis-hover :bordered="false" class="mt-16" title="收取费用">
                    <h2 class="total-fee">
                        {{ chart.type[0] | yuan }}
                        <small>元</small>
                    </h2>
                </Card>
            </Col>
            <Col :span="8">
                <Card dis-hover :bordered="false" class="mt-16" title="年度统计">
                    <div class="second-chart" ref="chart2" />
                </Card>
            </Col>
            <Col :span="8">
                <Card dis-hover :bordered="false" class="mt-16" title="退费比例">
                    <div class="second-chart" ref="chart3" />
                </Card>
            </Col>
        </Row>

        <Card dis-hover :bordered="false" class="mt-16" title="缴费概况">
            <div class="pay-chart" ref="chart1" />
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
import { Card, DatePicker, Button, Spin, Message, Row, Col } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';
import moment from 'moment';
import * as echarts from 'echarts';

export default {
    name: 'StatisticPayment',
    data() {
        const { start_date, end_date } = this.$route.query;
        const smom = moment().subtract(1, 'year');

        return {
            fetching: true,
            start_date: start_date ? parseInt(start_date, 10) : smom.valueOf(),
            end_date: end_date ? parseInt(end_date, 10) : moment().valueOf(),
            chart: {
                year: {},
                type: [0, 0],
                line: [],
                axis: []
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }

        this.$nextTick(() => {
            this.payChart = echarts.init(this.$refs.chart1);
            this.yearChart = echarts.init(this.$refs.chart2);
            this.typeChart = echarts.init(this.$refs.chart3);
        });

        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        this.payChart.dispose();
        this.yearChart.dispose();
        this.typeChart.dispose();
    },
    methods: {
        onResize() {
            this.payChart.resize();
            this.yearChart.resize();
            this.typeChart.resize();
        },
        onStartDateChange(d) {
            this.start_date = moment(d, 'YYYY年MM月DD日')
                .startOf('day')
                .valueOf();
        },
        onEndDateChange(d) {
            this.end_date = moment(d, 'YYYY年MM月DD日')
                .endOf('day')
                .valueOf();
        },
        getDetail() {
            const { postInfo, start_date, end_date } = this;

            if (!start_date || !end_date) {
                return Message.error('请选择时间范围');
            }

            if (start_date >= end_date) {
                return Message.error('开始日期应大于结束日期');
            }

            const smom = moment(start_date);
            const emom = moment(end_date);
            const diff = emom.diff(smom, 'month');

            if (diff === 0) {
                return Message.error('日期范围应大于一个月');
            }

            utils.request
                .post('/statistic/payment', {
                    start_date,
                    end_date,
                    community_id: postInfo.default_community_id
                })
                .then(res => {
                    const axis = [];
                    const line = [];
                    const type = [0, 0];
                    const year = {};

                    for (let i = 0; i <= diff; i++) {
                        axis.push(
                            smom
                                .clone()
                                .add(i, 'month')
                                .format('YYYY年MM月')
                        );
                        line[i] = 0;
                    }

                    res.data.list.forEach(({ start_year, end_year, paid_fee, fee, created_at }) => {
                        const fee_year = `${start_year}年至${end_year}年物业费`;

                        if (!(fee_year in year)) {
                            year[fee_year] = 0;
                        }

                        year[fee_year]++;
                        type[0] += paid_fee;
                        type[1] += fee - paid_fee;
                        line[moment(created_at).diff(smom, 'month')] += utils.payment.yuan(paid_fee);
                    });

                    this.chart = {
                        year,
                        type,
                        line,
                        axis
                    };
                    this.drawChart();

                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        drawChart() {
            const { line, axis, year, type } = this.chart;

            this.payChart.setOption({
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
                    data: axis,
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
                        name: '本月缴费统计',
                        showBackground: false,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#83bff6' },
                                { offset: 0.5, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ])
                        },
                        data: line
                    }
                ]
            });

            const yearData = [];
            for (let key in year) {
                yearData.push({
                    value: year[key],
                    name: key
                });
            }

            this.yearChart.setOption({
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        name: '年度统计',
                        type: 'pie',
                        radius: '50%',
                        data: yearData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            });

            this.typeChart.setOption({
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        name: '退费比例',
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
        DatePicker,
        Button,
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
    color: #30b08f;
    font-weight: 400;

    small {
        font-size: 16px;
        margin-left: 8px;
    }
}

.pay-chart {
    height: 32vh;
}

.second-chart {
    height: 24vh;
}
</style>
