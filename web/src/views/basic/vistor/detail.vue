<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="访客信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">访客编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.ower_id">
                    <span class="detail-label">
                        业主姓名
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/ower/detail/${detail.info.ower_id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.info.ower_name }}
                        </router-link>
                        <span v-else>{{ detail.info.ower_name }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.registrant">
                    <span class="detail-label">
                        登记人员
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.registrant.id}`">
                            {{ detail.registrant.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">到访地点</span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/building/detail/${detail.info.building_id}`"
                            v-if="userInfo.access.includes(ROLES.FCDA)"
                        >
                            {{ detail.info | building }}
                        </router-link>
                        <template v-else>
                            {{ detail.info | building }}
                        </template>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">访客称呼</span>
                    <div class="detail-content">{{ detail.info.vistor_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">访客电话</span>
                    <div class="detail-content">{{ detail.info.vistor_phone }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">访客车牌</span>
                    <div class="detail-content">{{ detail.info.car_number ? detail.info.car_number : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        到访状态
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.used_at ? 'success' : 'default'">
                            {{ detail.info.used_at ? '已到访' : '未到访' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    访客已注册「e家宜业」：
                    <Tag :color="detail.info.have_vistor_info ? 'success' : 'default'">
                        {{ detail.info.have_vistor_info ? '是' : '否' }}
                    </Tag>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">登记时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">访问有效期</span>
                    <div class="detail-content">{{ detail.info.expire | mom_format(false) }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.used_at" title="到访信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">到访时间</span>
                    <div class="detail-content">{{ detail.info.used_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        确认访客信息
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/oa/hr/colleague/detail/${detail.info.scan_user_id}`"
                            v-if="detail.info.scan_user_id"
                        >
                            {{ detail.info.scan_real_name }}
                        </router-link>
                        <span v-else>智能门禁</span>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="访客二维码" v-if="now <= detail.info.expire">
            <span slot="extra">
                <a v-if="!detail.info.used_at">请将此二维码发送给访客</a>
            </span>
            <canvas ref="canvas" class="mg-auto" />
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import qrcode from 'qrcode';

export default {
    name: 'BasicVistorDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                registrant: {},
                uid: ''
            },
            now: Date.now()
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/vistor/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;

                    this.$nextTick(() => {
                        qrcode.toCanvas(this.$refs.canvas, res.data.uid, {
                            width: 220,
                            height: 220,
                            margin: 2
                        });
                    });
                })
                .catch(() => (this.fetching = false));
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        num() {
            return utils.order.num('V', this.detail.info.created_at, this.detail.info.id);
        },
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
        },
        $route(cur, old) {
            if (cur.params.id !== old.params.id) {
                this.getDetail();
            }
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Tag,
        WaterMark
    }
};
</script>
