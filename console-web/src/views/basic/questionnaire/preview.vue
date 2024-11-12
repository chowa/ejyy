<template>
    <WaterMark class="questionnaire-preview">
        <Header back />

        <Card dis-hover :bordered="false" title="问卷信息">
            <span slot="extra">
                <a v-if="!detail.info.published" @click="doPublish">
                    <Icon type="ios-paper-plane" />
                    发布问卷
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">问卷名称</span>
                    <div class="detail-content">{{ detail.info.title }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">问卷问题</span>
                    <div class="detail-content">{{ detail.questions.length }}个</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        发布状态
                    </span>
                    <div class="detail-content">
                        <Tag :color="!detail.info.published ? 'default' : 'green'">
                            {{ !detail.info.published ? '未发布' : '已发布' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        发布时间
                    </span>
                    <div class="detail-content">
                        <span v-if="!detail.info.published">-</span>
                        <span v-else>{{ detail.info.published_at | mom_format }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">截止时间</span>
                    <div class="detail-content">{{ detail.info.expire | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        问卷创建人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.user_id}`">
                            {{ detail.info.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.published">
                    <span class="detail-label">
                        已参与问卷
                    </span>
                    <div class="detail-content">{{ detail.statistics.total }}人</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" :title="detail.info.published ? '问题统计' : '问题详细'" class="mt-16">
            <div class="question" v-for="(item, index) in detail.questions" :key="index">
                <div class="title-row">
                    <span>{{ index + 1 }}.</span>
                    {{ item.title }}
                </div>
                <div v-for="(row, key) in item.options" :key="key">
                    <div class="answer-row">
                        <span>
                            <Radio disabled v-if="item.type === 1" />
                            <Checkbox disabled v-if="item.type === 2" />
                        </span>
                        {{ row.option_val }}
                    </div>
                    <div v-if="detail.info.published" class="progress">
                        <Progress
                            :percent="
                                detail.statistics.options[row.id]
                                    ? parseInt((detail.statistics.options[row.id] / detail.statistics.total) * 100)
                                    : 0
                            "
                            hide-info
                        />
                        <span>
                            {{
                                detail.statistics.options[row.id]
                                    ? parseInt((detail.statistics.options[row.id] / detail.statistics.total) * 100)
                                    : 0
                            }}%
                        </span>
                    </div>
                </div>
            </div>
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
import { Card, Spin, Row, Col, Tag, Radio, Checkbox, Progress, Icon, Modal, Message } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'BasicQuestionnaireDetail',
    data() {
        return {
            ROLES,
            now: Date.now(),
            fetching: true,
            detail: {
                info: {},
                questions: [],
                statistics: {}
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
                .post('/questionnaire/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        doPublish() {
            Modal.confirm({
                title: '请确认',
                content: `确认要发布「${this.detail.info.title}」问卷吗？发布后将不可修改`,
                onOk: () => {
                    const data = {
                        community_id: this.postInfo.default_community_id,
                        id: this.detail.info.id
                    };

                    utils.request.post('/questionnaire/published', data).then(res => {
                        this.detail.info.published = true;
                        this.detail.info.published_at = res.data.published_at;
                        Message.success('问卷发布成功');
                    });
                }
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
        Card,
        Spin,
        Header,
        Row,
        Col,
        Tag,
        Radio,
        Checkbox,
        Progress,
        Icon,
        Modal,
        WaterMark
    }
};
</script>

<style lang="less">
.questionnaire-preview {
    .question {
        padding: 12px;

        .title-row {
            display: flex;
            flex-direction: row;
            line-height: 20px;
            margin-bottom: 14px;

            span {
                font-size: 14px;
                font-weight: 600;
                color: #222;
                padding-right: 10px;
            }
        }

        .answer-row {
            display: flex;
            flex-direction: row;
            line-height: 20px;
            margin-bottom: 4px;

            span {
                padding-right: 4px;
            }

            button {
                margin-left: 10px;
                padding: 0;
                width: 22px;
                height: 22px;
                font-size: 18px;
                line-height: 22px;
            }

            .ivu-radio-disabled .ivu-radio-inner,
            .ivu-checkbox-disabled .ivu-checkbox-inner {
                border: 1px solid #dcdee2;
                background: #fff;
            }
        }

        + .question {
            margin-top: 16px;
        }

        .progress {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;

            span {
                flex: none;
                width: 60px;
                padding-left: 12px;
                color: #666;
            }
        }
    }
}
</style>
