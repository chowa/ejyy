<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="文章信息" v-if="userInfo.access.includes(ROLES.DJDX)">
            <span slot="extra">
                <a v-if="!detail.published" @click="doPublish">
                    <Icon type="ios-paper-plane" />
                    发布党建党讯
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">文章编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">文章标题</span>
                    <div class="detail-content">{{ detail.title }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">创建时间</span>
                    <div class="detail-content">{{ detail.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        推送首页
                    </span>
                    <div class="detail-content">
                        <Tag :color="!detail.carousel ? 'default' : 'green'">
                            {{ detail.carousel ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.carousel">
                    <span class="detail-label">封面图片</span>
                    <div class="detail-content">
                        <Images :imgs="fetching ? [] : [detail.cover_img]" />
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

        <Card dis-hover :bordered="false" class="mt-16">
            <div class="article">
                <h2>{{ detail.title }}</h2>
                <h6>
                    <span>
                        撰稿人：
                        <router-link :to="`/oa/hr/colleague/detail/${detail.created_by}`">
                            {{ detail.real_name }}
                        </router-link>
                    </span>
                    <span v-if="detail.published">
                        发布人：
                        <router-link :to="`/oa/hr/colleague/detail/${detail.published_by}`">
                            {{ detail.published_real_name }}
                        </router-link>
                    </span>
                    <span>来自{{ detail.community_name }}小区</span>
                    <span v-if="detail.published">{{ detail.published_at | mom_format }}</span>
                </h6>
                <Editor display dir="notice" :value="detail.content ? detail.content : []" />
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Spin, Card, Tag, Row, Col, Icon, Modal, Message } from 'view-design';
import { Header, Editor, WaterMark, Images } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'OaPartyDetail',
    components: {
        Header,
        Editor,
        Spin,
        Card,
        Tag,
        Row,
        Col,
        Icon,
        WaterMark,
        Images
    },
    data() {
        return {
            fetching: true,
            detail: {},
            ROLES
        };
    },
    mounted() {
        this.getDetail();
    },
    methods: {
        getDetail() {
            utils.request
                .get(`/party/detail/${this.$route.params.id}`)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        doPublish() {
            Modal.confirm({
                title: '请确认',
                content: `确认要发布「${this.detail.title}」党建党讯吗？发布后将不可修改`,
                onOk: () => {
                    const data = {
                        community_id: this.postInfo.default_community_id,
                        id: this.detail.id
                    };

                    utils.request.post('/party/published', data).then(res => {
                        this.detail.published = true;
                        this.detail.published_at = res.data.published_at;
                        this.detail.published_by = this.userInfo.id;
                        this.detail.published_real_name = this.userInfo.real_name;
                        Message.success('党建党讯发布成功');
                    });
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
            return utils.order.num('PA', this.detail.created_at, this.detail.id);
        }
    }
};
</script>

<style lang="less">
.article {
    max-width: 980px;
    margin: auto;

    h2 {
        padding-top: 22px;
        text-align: center;
        color: #323333;
    }

    h6 {
        font-weight: 400;
        text-align: center;
        padding: 12px 22px;

        span + span {
            margin-left: 28px;
        }
    }
}
</style>
