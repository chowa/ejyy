<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="通知信息">
            <span slot="extra">
                <a v-if="!detail.published" @click="doPublish">
                    <Icon type="ios-paper-plane" />
                    发布通知
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">通知标题</span>
                    <div class="detail-content">{{ detail.title }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">通知概述</span>
                    <div class="detail-content">{{ detail.overview }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">创建时间</span>
                    <div class="detail-content">{{ detail.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        公众号推送
                    </span>
                    <div class="detail-content">
                        <Tag :color="!detail.notice_tpl_id ? 'default' : 'green'">
                            {{ detail.notice_tpl_id ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        是否发布
                    </span>
                    <div class="detail-content">
                        <Tag :color="!detail.published ? 'default' : 'green'">{{ detail.published ? '是' : '否' }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        发布时间
                    </span>
                    <div class="detail-content">
                        <span v-if="!detail.published">-</span>
                        <span v-else>{{ detail.published_at | mom_format }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        创建人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.created_by}`">
                            {{ detail.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.published">
                    <span class="detail-label">
                        发布人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.published_by}`">
                            {{ detail.published_real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="公众号推送" class="mt-16" v-if="detail.notice_tpl_id">
            <div class="wechat-tpl-preview">
                <div class="tpl-content">
                    <h4>{{ detail.tpl_title }}</h4>

                    <div v-for="(item, index) in detail.tpl_content" :key="index" class="row">
                        <span v-if="item.label">{{ item.label }}：</span>
                        <span>{{ item.value }}</span>
                    </div>
                </div>
                <div class="to-mp">
                    <span>详情</span>
                    <Icon type="ios-arrow-forward" />
                </div>
            </div>
        </Card>

        <Card dis-hover :bordered="false" title="通知正文" class="mt-16">
            <Editor display dir="notice" :value="detail.content ? detail.content : []" />
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
import { Spin, Card, Tag, Row, Col, Icon, Modal, Message } from 'view-design';
import { Header, Editor, WaterMark } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'BasicNoticePreview',
    components: {
        Header,
        Editor,
        Spin,
        Card,
        Tag,
        Row,
        Col,
        Icon,
        WaterMark
    },
    data() {
        return {
            fetching: true,
            detail: {}
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
                .post('/notice/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        doPublish() {
            Modal.confirm({
                title: '请确认',
                content: `确认要发布「${this.detail.title}」通知吗？发布后将不可修改`,
                onOk: () => {
                    const data = {
                        community_id: this.postInfo.default_community_id,
                        id: this.detail.id
                    };

                    utils.request.post('/notice/published', data).then(res => {
                        this.detail.published = true;
                        this.detail.published_at = res.data.published_at;
                        Message.success('小区通知发布成功');
                    });
                }
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    }
};
</script>

<style lang="less">
.wechat-tpl-preview {
    max-width: 320px;
    width: 320px;
    border: 1px solid #e3e4e5;
    margin: auto;

    .tpl-content {
        padding: 18px 20px;

        h4 {
            height: 26px;
            margin-bottom: 12px;
        }

        .row {
            display: flex;
            flex-direction: row;

            > span {
                flex: none;
            }
        }
    }

    .to-mp {
        padding: 6px 20px;
        border-top: 1px solid #e3e4e5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        color: #999;
    }
}
</style>
