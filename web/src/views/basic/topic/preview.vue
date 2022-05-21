<template>
    <section>
        <Header />

        <Card dis-hover :bordered="false" title="专题概要">
            <span slot="extra">
                <a @click="goUpdate">
                    <Icon type="ios-create-outline" />
                    修改专题
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">专题标题：{{ detail.title }}</Col>
                <Col :lg="8" :sm="12" :xs="24">发布时间：{{ detail.created_at | mom_format }}</Col>
                <Col :lg="8" :sm="12" :xs="24">
                    是否发布：
                    <Tag :color="detail.published === 0 ? 'default' : 'green'">
                        {{ detail.published === 0 ? '未发布' : '已发布' }}
                    </Tag>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    专题封面：
                    <Images v-if="!fetching && detail.banner_img" :imgs="[detail.banner_img]" />
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
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="专题正文" class="mt-16">
            <Editor display :value="detail.content ? detail.content : []" dir="topic" />
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
import { Spin, Card, Tag, Row, Col, Icon } from 'view-design';
import { Header, Editor, Images } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'BasicTopicCreate',
    components: {
        Header,
        Editor,
        Spin,
        Card,
        Tag,
        Row,
        Col,
        Images,
        Icon
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
                community_id: this.postInfo.default_community_id,
                id: this.$route.params.id
            };

            utils.request.post('/topic/detail', data).then(res => {
                this.fetching = false;
                this.detail = res.data;
            });
        },
        goUpdate() {
            this.$router.push(`/basic/topic/update/${this.$route.params.id}`);
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
