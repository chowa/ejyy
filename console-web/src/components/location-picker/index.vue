<template>
    <div class="location-picker">
        <div class="map" ref="map" />

        <Spin size="large" fix v-if="fetching || loading" />
    </div>
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
import { Spin } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import * as utils from '@/utils';
import { MAP_KEY } from '@/config';

export default {
    name: 'LocationPicker',
    mixins: [Emitter],
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fetching: true,
            loading: true,
            center: []
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getCenter();
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
        this.marker = null;
    },
    methods: {
        getCenter() {
            const data = {
                community_id: this.postInfo.default_community_id
            };

            this.fetching = false;
            utils.request
                .post('/option/location', data)
                .then(res => {
                    this.fetching = false;
                    this.center = [
                        res.data.lat ? res.data.lat : res.data.location.lat,
                        res.data.lng ? res.data.lng : res.data.location.lng
                    ];

                    if (this.map) {
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
            this.marker = null;
            this.map = new window.qq.maps.Map(this.$refs.map, {
                backgroundColor: '#f7f7f7',
                zoom: 18,
                mapTypeControl: false,
                draggableCursor: 'crosshair'
            });

            window.qq.maps.event.addListener(this.map, 'click', e => {
                const lng = e.latLng.getLng();
                const lat = e.latLng.getLat();

                this.$emit('input', [lat, lng]);
                this.$emit('on-change', [lat, lng]);
                this.dispatch('FormItem', 'on-form-change', [lat, lng]);

                this.setMarker();
            });

            if (this.value[0] && this.value[1]) {
                this.map.setCenter(new window.qq.maps.LatLng(this.value[0], this.value[1]));
                this.setMarker();
            } else if (this.center[0] && this.center[1]) {
                this.map.setCenter(new window.qq.maps.LatLng(this.center[0], this.center[1]));
            }

            this.loading = false;
        },
        setMarker() {
            const latlng = new window.qq.maps.LatLng(this.value[0], this.value[1]);

            if (!this.marker) {
                this.marker = new window.qq.maps.Marker({
                    position: latlng,
                    map: this.map
                });
            } else {
                this.marker.setPosition(latlng);
            }
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getCenter();
        },
        value(cur) {
            if (!this.map) return;

            if (cur[0] && cur[1]) {
                this.map.setCenter(new window.qq.maps.LatLng(cur[0], cur[1]));
                this.setMarker();
            } else {
                if (this.center[0] && this.center[1]) {
                    this.map.setCenter(new window.qq.maps.LatLng(this.center[0], this.center[1]));
                }

                if (this.marker) {
                    this.marker.setMap(null);
                    this.marker = null;
                }
            }
        }
    },
    components: {
        Spin
    }
};
</script>

<style lang="less">
.location-picker {
    width: 100%;
    height: 260px;
    position: relative;
    overflow: hidden;

    .map {
        width: 100%;
        height: 100%;
    }
}
</style>
