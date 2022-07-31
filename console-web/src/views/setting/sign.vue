<template>
    <section>
        <Header>
            <span slot="description">
                小区独立设置，当前小区是{{ community_name }}，切换小区请点击右上角，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

        <section>
            <Form
                label-position="right"
                :label-width="100"
                class="form-inline"
                :model="form"
                :rules="rules"
                ref="form"
                @submit.native.prevent
            >
                <Row :gutter="18">
                    <Col :span="8">
                        <FormItem prop="lng" label="经度：">
                            <Input v-model="form.lng" placeholder="请在地图上标记" readonly />
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem prop="lat" label="纬度：">
                            <Input v-model="form.lat" placeholder="请在地图上标记" readonly />
                        </FormItem>
                    </Col>
                    <Col :span="6">
                        <FormItem prop="distance" label="打卡半径：">
                            <Input v-model="form.distance" placeholder="请输入打卡半径（米）" />
                        </FormItem>
                    </Col>
                    <Col :span="2">
                        <Button type="primary" :loading="submiting" @click="submit">保存</Button>
                    </Col>
                </Row>
            </Form>

            <div class="map" ref="map" />
        </section>

        <Spin size="large" fix v-if="fetching || loading" />
    </section>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header } from '@/components';
import { Spin, Input, Form, FormItem, Row, Col, Button, Message } from 'view-design';
import * as utils from '@/utils';
import { MAP_KEY } from '@/config';

export default {
    name: 'SettingSign',
    data() {
        return {
            fetching: true,
            loading: true,
            submiting: false,
            form: {
                distance: undefined,
                lng: undefined,
                lat: undefined
            },
            rules: {
                distance: [{ required: true, message: '请输入打开半径，单位米' }],
                lng: [{ required: true, type: 'number', message: '请在地图上标记打卡中心位置' }],
                lat: [{ required: true, type: 'number', message: '请在地图上标记打卡中心位置' }]
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    created() {
        this.script = document.createElement('script');

        this.script.type = 'text/javascript';
        this.script.src = `//map.qq.com/api/js?v=2.exp&key=${MAP_KEY}&callback=initMap`;
        document.head.appendChild(this.script);

        window.initMap = this.initMap;
    },
    beforeDestroy() {
        document.head.removeChild(this.script);
        this.map = null;
    },
    methods: {
        getDetail() {
            const data = {
                community_id: this.postInfo.default_community_id
            };

            this.fetching = false;
            utils.request
                .post('/sign_setting/detail', data)
                .then(res => {
                    this.form = {
                        distance: res.data.distance ? res.data.distance : undefined,
                        lng: res.data.lng ? res.data.lng : undefined,
                        lat: res.data.lat ? res.data.lat : undefined
                    };
                    this.fetching = false;

                    if (this.map && this.form.lng) {
                        this.map.setCenter(
                            new window.qq.maps.LatLng(
                                res.data.lat ? res.data.lat : res.data.location.lat,
                                res.data.lng ? res.data.lng : res.data.location.lng
                            )
                        );
                    }
                })
                .catch(() => (this.fetching = false));
        },
        initMap() {
            let marker = null;
            this.map = new window.qq.maps.Map(this.$refs.map, {
                backgroundColor: '#f7f7f7',
                mapStyleId: 'style2',
                zoom: 16,
                mapTypeControlOptions: {
                    mapTypeIds: []
                },
                draggableCursor: 'crosshair'
            });

            const setMarker = () => {
                const latlng = new window.qq.maps.LatLng(this.form.lat, this.form.lng);

                if (!marker) {
                    marker = new window.qq.maps.Marker({
                        position: latlng,
                        map: this.map
                    });
                } else {
                    marker.setPosition(latlng);
                }
            };

            window.qq.maps.event.addListener(this.map, 'click', e => {
                this.form.lng = e.latLng.getLng(); // 经度
                this.form.lat = e.latLng.getLat(); // 纬度
                setMarker();
            });

            if (this.form.lng) {
                this.map.setCenter(new window.qq.maps.LatLng(this.form.lat, this.form.lng));
                setMarker();
            }

            this.loading = false;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                utils.request
                    .post('/sign_setting/create', {
                        community_id: this.postInfo.default_community_id,
                        ...this.form
                    })
                    .then(() => {
                        this.submiting = false;
                        Message.success('考勤设置成功');
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Header,
        Spin,
        Input,
        Form,
        FormItem,
        Row,
        Col,
        Button
    }
};
</script>

<style lang="less">
.form-inline {
    padding-top: 0 !important;
}

.map {
    width: 100%;
    height: calc(~'100vh - 307px');
}
</style>
