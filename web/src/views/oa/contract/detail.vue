<template>
    <WaterMark class="contract-detail">
        <Header back />

        <Card dis-hover :bordered="false" title="合同信息">
            <span slot="extra">
                <a
                    v-if="
                        detail.info.created_user_id === userInfo.id &&
                            detail.info.finish_time + 7000 * 24 * 60 * 60 > now
                    "
                    @click="goUpdate"
                >
                    <Icon type="ios-create-outline" />
                    修改合同
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同名称</span>
                    <div class="detail-content">{{ detail.info.title }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同类别</span>
                    <div class="detail-content">{{ detail.info.category }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">甲方</span>
                    <div class="detail-content">{{ detail.info.first_party }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">甲方联系人</span>
                    <div class="detail-content">{{ detail.info.first_party_linkman }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">甲方联系电话</span>
                    <div class="detail-content">{{ detail.info.first_party_phone }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="!detail.info.second_party_user_id">
                    <span class="detail-label">
                        乙方
                    </span>
                    <div class="detail-content">{{ detail.info.second_party }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="!detail.info.second_party_user_id">
                    <span class="detail-label">
                        乙方联系人
                    </span>
                    <div class="detail-content">{{ detail.info.second_party_linkman }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="!detail.info.second_party_user_id">
                    <span class="detail-label">
                        乙方联系电话
                    </span>
                    <div class="detail-content">{{ detail.info.second_party_phone }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.second_party_user_id">
                    <span class="detail-label">
                        乙方业主
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/ower/detail/${detail.info.second_party_user_id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.info.second_party_user_real_name }}
                        </router-link>
                        <span v-else>{{ detail.info.second_party_user_real_name }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同金额</span>
                    <div class="detail-content">{{ detail.info.contract_fee }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同开始时间</span>
                    <div class="detail-content">{{ detail.info.begin_time | mom_format(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同结束时间</span>
                    <div class="detail-content">{{ detail.info.finish_time | mom_format(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">合同创建时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        创建人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.created_user_id}`">
                            {{ detail.info.created_user_real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="合同项目" class="mt-16">
            <div class="item" v-for="(item, index) in detail.items" :key="item.id">
                <Row class="detail-row">
                    <Col :lg="8" :sm="12" :xs="24">
                        <span class="detail-label">项目{{ index + 1 }}名称</span>
                        <div class="detail-content">{{ item.title }}</div>
                    </Col>
                    <Col :lg="8" :sm="12" :xs="24">
                        <span class="detail-label">项目{{ index + 1 }}备注</span>
                        <div class="detail-content">{{ item.description ? item.description : '-' }}</div>
                    </Col>
                    <Col :lg="8" :sm="12" :xs="24">
                        <span class="detail-label">项目{{ index + 1 }}金额</span>
                        <div class="detail-content">{{ item.fee }}</div>
                    </Col>
                    <Col :lg="8" :sm="12" :xs="24" v-if="item.building_id">
                        <span class="detail-label">项目{{ index + 1 }}关联房产</span>
                        <div class="detail-content">
                            <router-link
                                :to="`/basic/building/detail/${item.building_id}`"
                                v-if="userInfo.access.includes(ROLES.FCDA)"
                            >
                                {{ item | building }}
                            </router-link>
                            <span v-else>{{ item | building }}</span>
                        </div>
                    </Col>
                    <Col :lg="8" :sm="12" :xs="24">
                        <span class="detail-label">项目{{ index + 1 }}附件</span>
                        <div class="detail-content">
                            <a :href="ASSET_HOST + item.attachment_url" v-if="item.attachment_url" target="_blank">
                                {{ item.attachment_name }}
                            </a>
                            <span v-else>-</span>
                        </div>
                    </Col>
                </Row>
            </div>
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Icon } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';
import { ASSET_HOST } from '@/config';
import ROLES from '@/constants/role';

export default {
    name: 'OaContractDetail',
    data() {
        return {
            ROLES,
            ASSET_HOST,
            now: Date.now(),
            fetching: true,
            detail: {
                info: {},
                items: []
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }

        this.timer = setInterval(() => {
            this.now = Date.now();
        }, 1000);
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/contract/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        goUpdate() {
            this.$router.push(`/oa/contract/update/${this.$route.params.id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        num() {
            return utils.order.num('CN', this.detail.info.created_at, this.detail.info.id);
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
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Icon,
        WaterMark
    }
};
</script>

<style lang="less">
.contract-detail {
    .item {
        & + .item {
            border-top: 1px dashed #eee;
        }
    }
}
</style>
