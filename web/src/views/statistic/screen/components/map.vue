<template>
    <section class="card map" ref="map"></section>
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

import { MAP_KEY } from '@/config';

export default {
    name: 'MapChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    center: {},
                    entrance: [],
                    elevator: [],
                    lamp: [],
                    repeater: [],
                    park: [],
                    warning: []
                };
            }
        },
        log: {
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
    created() {
        this.script = document.createElement('script');

        this.script.type = 'text/javascript';
        this.script.src = `//map.qq.com/api/gljs?v=1.exp&key=${MAP_KEY}&libraries=visualization&callback=initMap`;
        document.head.appendChild(this.script);

        window.initMap = this.initMap;
    },
    beforeDestroy() {
        document.head.removeChild(this.script);
        this.map = null;
    },
    methods: {
        initMap() {
            this.arc = null;
            this.map = new window.TMap.Map(this.$refs.map, {
                zoom: 19,
                mapStyleId: 'style3',
                pitch: 50,
                showControl: false
            });

            document.querySelector('.logo-text').parentElement.style = 'display: none!important;';

            this.resetMap();
        },
        resetMap() {
            if (!this.detail.center.lat || !this.detail.center.lng || !this.map) {
                return;
            }

            this.map.setCenter(new window.TMap.LatLng(this.detail.center.lat, this.detail.center.lng));

            if (this.arc) {
                this.arc.remove();
                this.dot.remove();
                this.radiationCircle.remove();
                this.heat.remove();
            }

            const lineData = [];
            const dotData = [];
            const radiationCircle = [];
            const heatData = {};

            for (let tp in this.detail) {
                if (tp === 'center') {
                    continue;
                }

                this.detail[tp].forEach(item => {
                    if (item.lat && item.lng) {
                        lineData.push({
                            id: tp,
                            from: { lat: item.lat, lng: item.lng },
                            to: { lat: this.detail.center.lat, lng: this.detail.center.lng }
                        });

                        dotData.push({ lat: item.lat, lng: item.lng });
                        radiationCircle.push({
                            radius: 5,
                            center: new window.TMap.LatLng(item.lat, item.lng)
                        });

                        if (!(tp in heatData)) {
                            heatData[tp] = {
                                lat: item.lat,
                                lng: item.lng,
                                count: this.log[tp].length
                            };
                        }
                    }
                });
            }

            if (lineData.length === 0) return;

            this.arc = new window.TMap.visualization.Arc({
                mode: 'vertical',
                enableBloom: true,
                zIndex: 2,
                processAnimation: {
                    tailFactor: 0.6
                },
                pickStyle: arcLine => {
                    const baseStyle = {
                        color: 'rgba(1,124,247,0.1)',
                        width: 3
                    };

                    switch (arcLine.id) {
                        case 'entrance':
                            return {
                                ...baseStyle,
                                animateColor: '#eb2f96'
                            };

                        case 'elevator':
                            return {
                                ...baseStyle,
                                animateColor: '#1890ff'
                            };

                        case 'lamp':
                            return {
                                ...baseStyle,
                                animateColor: '#13c2c2'
                            };

                        case 'repeater':
                            return {
                                ...baseStyle,
                                animateColor: '#52c41a'
                            };

                        case 'park':
                            return {
                                ...baseStyle,
                                animateColor: '#722ed1'
                            };

                        case 'warning':
                            return {
                                ...baseStyle,
                                animateColor: '#ed4014'
                            };
                    }
                }
            })
                .addTo(this.map)
                .setData(lineData);

            this.radiationCircle = new window.TMap.visualization.Radiation({
                styles: {
                    default: {
                        fillColor: 'rgba(0,0,0,0)', // 辐射圈填充颜色
                        strokeColor: '#FFF', // 辐射圈边线颜色
                        strokeWidth: 2 //	区域边线宽度
                    }
                },
                zIndex: 3,
                number: 2 // 每一时刻，辐射圈的同心圆个数
            })
                .addTo(this.map)
                .setData(radiationCircle);

            //初始化散点图
            this.dot = new window.TMap.visualization.Dot({
                styles: {
                    default: {
                        fillColor: '#FFF', //圆形填充颜色
                        radius: 2 //圆形半径
                    }
                },
                zIndex: 4,
                enableBloom: true // 泛光
            })
                .addTo(this.map)
                .setData(dotData);

            this.heat = new window.TMap.visualization.Heat({
                max: 60, // 热力最强阈值
                min: 0, // 热力最弱阈值
                height: 50, // 峰值高度
                gradientColor: new window.TMap.GradientColor({
                    stops: {
                        0.2: '#7CFFB2',
                        0.5: '#58D9F9',
                        0.7: '#FDDD60',
                        0.9: '#FF6E76'
                    }
                }),
                enableLighting: true,
                zIndex: 5,
                radius: 30 // 最大辐射半径
            })
                .addTo(this.map)
                .setData(Object.values(heatData));
        }
    },
    watch: {
        detail: {
            deep: true,
            handler() {
                this.resetMap();
            }
        }
    }
};
</script>

<style lang="less">
.map {
    flex: 0 0 62%;
    margin-bottom: 16px;
    overflow: hidden;
    padding: 0 !important;
}
</style>
