<template>
    <section>
        <Header back />

        <Card dis-hover :bordered="false">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">所在小区</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        业主姓名
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/ower/detail/${detail.info.wechat_mp_user_id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.info.user_real_name }}
                        </router-link>
                        <span v-else>{{ detail.info.user_real_name }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">体温</span>
                    <div class="detail-content">{{ detail.info.temperature }}℃</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        健康码
                    </span>
                    <div class="detail-content">
                        <Tag :color="code.color">{{ code.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        出入住所
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/building/detail/${detail.info.building_id}`"
                            v-if="userInfo.access.includes(ROLES.FCDA)"
                        >
                            {{ detail.info | building(false) }}
                        </router-link>
                        <span v-else>{{ detail.info | building(false) }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        外地返回
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.return_hometown ? 'orange' : 'default'">
                            {{ detail.info.return_hometown ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.return_hometown">
                    <span class="detail-label">
                        返回地
                    </span>
                    <div class="detail-content">
                        {{ detail.info.return_from_province }}{{ detail.info.return_from_city
                        }}{{ detail.info.return_from_district }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        登记人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.created_by}`">
                            {{ detail.info.created_user_real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">登记时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Spin size="large" fix v-if="fetching" />
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
import { Card, Spin, Row, Col, Tag } from 'view-design';
import { Header } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'BasicEpidemicDetail',
    data() {
        return {
            ROLES,
            now: Date.now(),
            fetching: true,
            detail: {
                info: {}
            }
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
                .post('/epidemic/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        },
        code() {
            let text = '';
            let color = '';

            switch (this.detail.info.tour_code) {
                case 1:
                    text = '绿色';
                    color = 'success';
                    break;

                case 2:
                    text = '黄色';
                    color = 'warning';
                    break;

                case 3:
                    text = '红色';
                    color = 'error';
                    break;
            }

            return { text, color };
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Tag
    }
};
</script>
