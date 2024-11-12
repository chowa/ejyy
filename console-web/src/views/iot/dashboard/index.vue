<template>
    <section class="iot-dashboard">
        <Row :gutter="18">
            <Col :lg="4" :sm="8" :xs="12">
                <div class="iot-card">
                    <h3>智能门禁</h3>
                    <Icon type="entrance" color="#eb2f96" />
                    <p class="error">
                        发现
                        <span>{{ entrance.error }}</span>
                        个终端异常
                    </p>
                    <p class="total">
                        部署
                        <span>{{ entrance.total }}</span>
                        个终端
                    </p>
                </div>
            </Col>
            <Col :lg="4" :sm="8" :xs="12">
                <div class="iot-card">
                    <h3>智能梯控</h3>
                    <Icon type="elevator" color="#1890ff" />
                    <p class="error">
                        发现
                        <span>{{ elevator.error }}</span>
                        个终端异常
                    </p>
                    <p class="total">
                        部署
                        <span>{{ elevator.total }}</span>
                        个终端
                    </p>
                </div>
            </Col>
            <Col :lg="4" :sm="8" :xs="12">
                <div class="iot-card">
                    <h3>智慧照明</h3>
                    <Icon type="lamp" color="#13c2c2" />
                    <p class="error">
                        发现
                        <span>{{ lamp.error }}</span>
                        个终端异常
                    </p>
                    <p class="total">
                        部署
                        <span>{{ lamp.total }}</span>
                        个终端
                    </p>
                </div>
            </Col>
            <Col :lg="4" :sm="8" :xs="12">
                <div class="iot-card">
                    <h3>能耗管理</h3>
                    <Icon type="energy" color="#52c41a" />
                    <p class="error">
                        发现
                        <span>{{ repeater.error }}</span>
                        个终端异常
                    </p>
                    <p class="total">
                        部署
                        <span>{{ repeater.total }}</span>
                        个终端
                    </p>
                </div>
            </Col>
            <Col :lg="4" :sm="8" :xs="12">
                <div class="iot-card">
                    <h3>智慧停车</h3>
                    <Icon type="park" color="#722ed1" />
                    <p class="error">
                        发现
                        <span>{{ park.error }}</span>
                        个终端异常
                    </p>
                    <p class="total">
                        部署
                        <span>{{ park.total }}</span>
                        个终端
                    </p>
                </div>
            </Col>
            <Col :lg="4" :sm="8" :xs="12">
                <div class="iot-card">
                    <h3>智慧预警</h3>
                    <Icon type="warning" color="#ed4014" />
                    <p class="error">
                        发现
                        <span>{{ warning.error }}</span>
                        个终端异常
                    </p>
                    <p class="total">
                        部署
                        <span>{{ warning.total }}</span>
                        个终端
                    </p>
                </div>
            </Col>
        </Row>
        <div class="iot-chart" ref="chart" />

        <Spin size="large" fix v-if="fetching" />
    </section>
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
import { Row, Col, Icon, Spin } from 'view-design';
import * as utils from '@/utils';
import { SITE_TITLE } from '@/config';
import * as echarts from 'echarts';
import dagre from 'dagre';
import { LOGO, CLOUD, ENTRANCE, ELEVATOR, LAMP, LAMP_LINE, REPEATER, PARK, WARNING } from './svg-path';

export default {
    name: 'IotDashboard',
    data() {
        return {
            fetching: true,
            nodes: [],
            lines: [],
            graphWidth: 0,
            graphHeight: 0,
            xMax: 100,
            yMax: 100,
            detail: {
                entrance: [],
                elevator: [],
                lamp: [],
                repeater: [],
                park: [],
                warning: []
            }
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.chart = echarts.init(this.$refs.chart);
        });

        if (this.postInfo.default_community_id) {
            this.getDetail();
        }

        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        this.chart.dispose();
    },
    methods: {
        getDetail() {
            const data = {
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/statistic/iot', data).then(res => {
                this.fetching = false;
                this.detail = res.data;

                const graph = new dagre.graphlib.Graph();
                const ejyy = 'ejyy';
                const nodeOption = {
                    width: 30,
                    height: 50
                };

                graph.setGraph({
                    rankdir: 'BT',
                    align: 'DR',
                    ranker: 'longest-path',
                    ranksep: 200,
                    edgesep: 30
                });
                graph.setDefaultEdgeLabel(() => {
                    return {};
                });

                // 添加logo
                graph.setNode(ejyy, { label: SITE_TITLE, ...nodeOption, symbol: `path://${LOGO}`, color: '#3EDCD9' });

                if (Array.isArray(res.data.entrance)) {
                    graph.setNode('entrance', {
                        label: '智能门禁',
                        ...nodeOption,
                        symbol: `path://${CLOUD}`,
                        color: '#ffa2d3'
                    });
                    graph.setEdge(ejyy, 'entrance');

                    res.data.entrance.forEach(({ name }, key) => {
                        const nodeName = `门禁${key}`;

                        graph.setNode(nodeName, {
                            label: name,
                            ...nodeOption,
                            symbol: `path://${ENTRANCE}`,
                            color: '#eb2f96'
                        });
                        graph.setEdge('entrance', nodeName);
                    });
                }

                if (Array.isArray(res.data.elevator)) {
                    graph.setNode('elevator', {
                        label: '智能梯控',
                        ...nodeOption,
                        symbol: `path://${CLOUD}`,
                        color: '#ffa2d3'
                    });
                    graph.setEdge(ejyy, 'elevator');

                    res.data.elevator.forEach(({ name }, key) => {
                        const nodeName = `梯控${key}`;

                        graph.setNode(nodeName, {
                            label: name,
                            ...nodeOption,
                            symbol: `path://${ELEVATOR}`,
                            color: '#1890ff'
                        });
                        graph.setEdge('elevator', nodeName);
                    });
                }

                if (Array.isArray(res.data.lamp)) {
                    graph.setNode('lamp', {
                        label: '智慧照明',
                        ...nodeOption,
                        symbol: `path://${CLOUD}`,
                        color: '#ffa2d3'
                    });
                    graph.setEdge(ejyy, 'lamp');

                    res.data.lamp.forEach(({ name, line }, key) => {
                        const nodeName = `灯控${key}`;

                        graph.setNode(nodeName, {
                            label: name,
                            ...nodeOption,
                            symbol: `path://${LAMP}`,
                            color: '#fa8c16'
                        });
                        graph.setEdge('lamp', nodeName);

                        line.forEach((name, key) => {
                            const lineName = `照明线路${key}`;

                            graph.setNode(lineName, {
                                label: name,
                                ...nodeOption,
                                symbol: `path://${LAMP_LINE}`,
                                color: '#13c2c2'
                            });
                            graph.setEdge(nodeName, lineName);
                        });
                    });
                }

                if (Array.isArray(res.data.repeater)) {
                    graph.setNode('repeater', {
                        label: '能耗管理',
                        ...nodeOption,
                        symbol: `path://${CLOUD}`,
                        color: '#ffa2d3'
                    });
                    graph.setEdge(ejyy, 'repeater');

                    res.data.repeater.forEach(({ name }, key) => {
                        const nodeName = `中继${key}`;

                        graph.setNode(nodeName, {
                            label: name,
                            ...nodeOption,
                            symbol: `path://${REPEATER}`,
                            color: '#52c41a'
                        });
                        graph.setEdge('repeater', nodeName);
                    });
                }

                if (Array.isArray(res.data.park)) {
                    graph.setNode('park', {
                        label: '智慧停车',
                        ...nodeOption,
                        symbol: `path://${CLOUD}`,
                        color: '#ffa2d3'
                    });
                    graph.setEdge(ejyy, 'park');

                    res.data.park.forEach(({ name }, key) => {
                        const nodeName = `停车场${key}`;

                        graph.setNode(nodeName, {
                            label: name,
                            ...nodeOption,
                            symbol: `path://${PARK}`,
                            color: '#722ed1'
                        });
                        graph.setEdge('park', nodeName);
                    });
                }

                if (Array.isArray(res.data.warning)) {
                    graph.setNode('warning', {
                        label: '智慧预警',
                        ...nodeOption,
                        symbol: `path://${CLOUD}`,
                        color: '#ffa2d3'
                    });
                    graph.setEdge(ejyy, 'warning');

                    res.data.warning.forEach(({ name }, key) => {
                        const nodeName = `预警中控${key}`;

                        graph.setNode(nodeName, {
                            label: name,
                            ...nodeOption,
                            symbol: `path://${WARNING}`,
                            color: '#ed4014'
                        });
                        graph.setEdge('warning', nodeName);
                    });
                }

                dagre.layout(graph);

                this.nodes = graph.nodes().map(n => {
                    const { label, width, symbol, x, y, color } = graph.node(n);

                    if (x > this.xMax) {
                        this.xMax = x;
                    }

                    if (y > this.yMax) {
                        this.yMax = y;
                    }

                    return {
                        symbolSize: width,
                        symbol,
                        value: [x, y],
                        label,
                        itemStyle: {
                            color: color ? color : 'orange'
                        }
                    };
                });

                this.lines = graph.edges().map(e => {
                    return {
                        coords: graph
                            .edge(e)
                            .points.reverse()
                            .map(({ x, y }) => {
                                return [x, y];
                            })
                    };
                });

                this.graphWidth = graph.graph().width;
                this.graphHeight = graph.graph().height;

                this.$nextTick(() => {
                    this.drawChart();
                });
            });
        },
        onResize() {
            this.chart.resize();
        },
        drawChart() {
            const margin = window.innerWidth < 700 ? 0 : 80;

            this.chart.setOption({
                grid: {
                    top: margin,
                    left: margin,
                    right: margin,
                    bottom: margin
                },
                xAxis: {
                    min: 0,
                    max: this.xMax,
                    show: false,
                    type: 'value'
                },
                yAxis: {
                    min: 0,
                    max: this.yMax,
                    show: false,
                    type: 'value'
                },
                series: [
                    {
                        type: 'graph',
                        layout: 'none',
                        coordinateSystem: 'cartesian2d',
                        zlevel: 1,
                        label: {
                            show: true,
                            position: 'bottom',
                            color: '#444',
                            formatter: item => item.data.label
                        },
                        data: this.nodes
                    },
                    {
                        type: 'lines',
                        polyline: true,
                        coordinateSystem: 'cartesian2d',
                        zlevel: 2,
                        lineStyle: {
                            width: 1,
                            curveness: 0.6,
                            join: 'miter',
                            type: 'dashed',
                            color: '#ddd'
                        },
                        effect: {
                            show: true,
                            symbol: 'circle',
                            symbolSize: 6,
                            color: '#2d8cf0'
                        },
                        data: this.lines
                    }
                ]
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        entrance() {
            return {
                total: this.detail.entrance.length,
                error: this.detail.entrance.filter(item => !item.online).length
            };
        },
        elevator() {
            return {
                total: this.detail.elevator.length,
                error: this.detail.elevator.filter(item => !item.online).length
            };
        },
        lamp() {
            return {
                total: this.detail.lamp.length,
                error: this.detail.lamp.filter(item => !item.online).length
            };
        },
        repeater() {
            return {
                total: this.detail.repeater.length,
                error: this.detail.repeater.filter(item => !item.online).length
            };
        },
        park() {
            return {
                total: this.detail.park.length,
                error: this.detail.park.filter(item => !item.online).length
            };
        },
        warning() {
            return {
                total: this.detail.warning.length,
                error: this.detail.warning.filter(item => !item.online).length
            };
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
        Spin
    }
};
</script>

<style lang="less">
.iot-dashboard {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .ivu-row {
        flex: none;
        min-width: 100%;
        padding-bottom: 16px;
    }

    .iot-card {
        height: 100%;
        background-color: #fff;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        padding: 0 16px 32px 16px;
        overflow: hidden;

        h3 {
            font-size: 14px;
            line-height: 28px;
            color: #999;
            margin-bottom: 18px;
            width: 100%;
            text-align: left;
            font-weight: 400;
            margin-top: 12px;
        }

        .ivu-icon {
            font-size: 36px;
        }

        p {
            font-size: 14px;
            line-height: 22px;
            color: #666;

            span {
                margin: 0 6px;
            }
        }

        .error {
            margin-top: 16px;

            span {
                color: #ed4014;
            }
        }

        .total {
            margin-top: 8px;

            span {
                color: #444;
            }
        }
    }

    .iot-chart {
        width: 100%;
        min-height: 500px;
        flex: auto;
        overflow: hidden;
        background-color: #fff;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
    }
}

@media screen and (max-width: 989px) {
    .iot-dashboard {
        .ivu-col:nth-child(n + 4) {
            margin-top: 16px;
        }
    }
}

@media screen and (max-width: 576px) {
    .iot-dashboard {
        .ivu-col:nth-child(n + 3) {
            margin-top: 16px;
        }
    }
}
</style>
