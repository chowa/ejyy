<template>
    <WaterMark>
        <Header back />

        <Row :gutter="22">
            <Col :lg="10" :sm="24" :xs="24">
                <Card dis-hover :bordered="false" title="审批进度">
                    <WorkflowTimeline
                        :steps="detail.steps"
                        label="请假天数"
                        :info="detail.info"
                        :userId="userInfo.id"
                        :onApprover="doApprover"
                        :onBindRelation="bindRelation"
                    />
                </Card>
            </Col>
            <Col :lg="14" :sm="24" :xs="24">
                <Card dis-hover :bordered="false" title="请假详情">
                    <span slot="extra">
                        <a
                            @click="cancel"
                            v-if="
                                !detail.info.cancel &&
                                    detail.info.success === null &&
                                    userInfo.id === detail.info.created_by
                            "
                        >
                            <Icon type="md-return-left" />
                            撤销申请
                        </a>
                    </span>

                    <Row class="detail-row">
                        <Col :lg="12" :sm="12" :xs="24">
                            <span class="detail-label">流程编号</span>
                            <div class="detail-content">{{ num }}</div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24" v-if="userInfo.id !== detail.info.created_by">
                            <span class="detail-label">申请人</span>
                            <div class="detail-content">
                                <router-link :to="`/oa/hr/colleague/detail/${detail.info.created_by}`">
                                    {{ detail.info.real_name }}
                                </router-link>
                            </div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24">
                            <span class="detail-label">请假时间</span>
                            <div class="detail-content">
                                {{ detail.info.begin_date | mom_format(false) }}
                            </div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24">
                            <span class="detail-label">请假天数</span>
                            <div class="detail-content">{{ detail.info.total }}天</div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24">
                            <span class="detail-label">申请时间</span>
                            <div class="detail-content">
                                {{ detail.info.created_at | mom_format }}
                            </div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24">
                            <span class="detail-label">申请结果</span>
                            <div class="detail-content">
                                <Tag v-if="detail.info.cancel" color="warning">已撤销</Tag>
                                <Tag v-else-if="detail.info.success === null" color="blue">审核中</Tag>
                                <Tag v-else :color="detail.info.success ? 'success' : 'red'">
                                    {{ detail.info.success ? '成功' : '驳回' }}
                                </Tag>
                            </div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24" v-if="detail.info.cancel">
                            <span class="detail-label">撤销时间</span>
                            <div class="detail-content">
                                {{ detail.info.canceled_at | mom_format }}
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag, Modal, Message, Icon } from 'view-design';
import { Header, WaterMark, WorkflowTimeline } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'OaLeaveDetail',
    data() {
        return {
            fetching: true,
            detail: {
                info: {},
                steps: []
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
                .post('/leave/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        doApprover({ node_id, agree, reason }) {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id,
                node_id,
                agree,
                reason
            };

            return new Promise(resolve => {
                utils.request
                    .post('/leave/flow', data)
                    .then(() => {
                        resolve();
                        this.getDetail();
                    })
                    .catch(() => resolve());
            });
        },
        bindRelation({ node_id, relation_user_id }) {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id,
                node_id,
                relation_user_id
            };

            return new Promise(resolve => {
                utils.request
                    .post('/leave/assign', data)
                    .then(() => {
                        resolve();
                        this.getDetail();
                    })
                    .catch(() => resolve());
            });
        },
        cancel() {
            Modal.confirm({
                title: '请确认',
                content: '确认要撤销本次请假流程吗？此操作不可恢复',
                onOk: () => {
                    const data = {
                        id: this.$route.params.id,
                        community_id: this.postInfo.default_community_id
                    };

                    utils.request
                        .post('/leave/cancel', data)
                        .then(res => {
                            this.detail.info.cancel = 1;
                            this.detail.info.canceled_at = res.data.canceled_at;
                            Message.success('撤销成功');
                        })
                        .catch(() => {});
                }
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        num() {
            return utils.order.num('LF', this.detail.info.created_at, this.detail.info.id);
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
        Tag,
        WaterMark,
        WorkflowTimeline,
        Icon
    }
};
</script>
