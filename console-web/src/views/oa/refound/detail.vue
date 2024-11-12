<template>
    <WaterMark>
        <Header back />

        <Row :gutter="22">
            <Col :lg="10" :sm="24" :xs="24">
                <Card dis-hover :bordered="false" title="审批进度">
                    <WorkflowTimeline
                        :steps="detail.steps"
                        label="报销金额"
                        :info="detail.info"
                        :userId="userInfo.id"
                        :onApprover="doApprover"
                        :onBindRelation="bindRelation"
                    />
                </Card>
            </Col>
            <Col :lg="14" :sm="24" :xs="24">
                <Card dis-hover :bordered="false" title="报销详细">
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
                            <span class="detail-label">费用产生时间</span>
                            <div class="detail-content">
                                {{ detail.info.begin_date | mom_format(false) }} 至
                                {{ detail.info.finish_date | mom_format(false) }}
                            </div>
                        </Col>
                        <Col :lg="12" :sm="12" :xs="24">
                            <span class="detail-label">报销总金额</span>
                            <div class="detail-content">{{ detail.info.total }}元</div>
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

                <Card dis-hover :bordered="false" title="报销项目" class="mt-16">
                    <div v-for="(item, key) in detail.items" :key="item.id" class="refound-item">
                        <h4>报销项目（{{ key + 1 }}）信息</h4>
                        <Row class="detail-row">
                            <Col :lg="12" :sm="12" :xs="24">
                                <span class="detail-label">花销用途</span>
                                <div class="detail-content">{{ item.reason }}</div>
                            </Col>
                            <Col :lg="12" :sm="12" :xs="24">
                                <span class="detail-label">发票代码</span>
                                <div class="detail-content">{{ item.code }}</div>
                            </Col>
                            <Col :lg="12" :sm="12" :xs="24">
                                <span class="detail-label">发票号码</span>
                                <div class="detail-content">{{ item.num }}</div>
                            </Col>
                            <Col :lg="12" :sm="12" :xs="24">
                                <span class="detail-label">开票日期</span>
                                <div class="detail-content">{{ item.date | mom_format(false) }}</div>
                            </Col>
                            <Col :lg="12" :sm="12" :xs="24">
                                <span class="detail-label">电子发票</span>
                                <div class="detail-content">
                                    <Images :imgs="[item.attachment_url]" />
                                </div>
                            </Col>
                            <Col :lg="12" :sm="12" :xs="24">
                                <span class="detail-label">报销金额</span>
                                <div class="detail-content">{{ item.fee }}元</div>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Col>
        </Row>

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
import { Card, Spin, Row, Col, Tag, Icon, Modal, Message } from 'view-design';
import { Header, WaterMark, WorkflowTimeline, Images } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'OaRefoundDetail',
    data() {
        return {
            fetching: true,
            detail: {
                info: {},
                steps: [],
                items: []
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
                .post('/refound/detail', data)
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
                    .post('/refound/flow', data)
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
                    .post('/refound/assign', data)
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
                content: '确认要撤销本次报销流程吗？此操作不可恢复',
                onOk: () => {
                    const data = {
                        id: this.$route.params.id,
                        community_id: this.postInfo.default_community_id
                    };

                    utils.request
                        .post('/refound/cancel', data)
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
            return utils.order.num('RF', this.detail.info.created_at, this.detail.info.id);
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
        Images,
        Icon
    }
};
</script>

<style lang="less">
.refound-item {
    padding-top: 20px;

    h4 {
        text-align: center;
        padding-bottom: 12px;
    }

    & + .refound-item {
        border-top: 1px dashed #eee;
    }
}
</style>
