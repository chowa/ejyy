<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="会议信息">
            <span slot="extra">
                <a @click="cancel" v-if="!detail.info.cancel && userInfo.id === detail.info.created_by">
                    <Icon type="ios-close-circle-outline" />
                    取消
                </a>
            </span>
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议时间</span>
                    <div class="detail-content">
                        {{ detail.info.start_time | mom_format }} 至 {{ detail.info.end_time | mom_format }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议室</span>
                    <div class="detail-content">{{ detail.info.name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议室位置</span>
                    <div class="detail-content">{{ detail.info.local }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议主题</span>
                    <div class="detail-content">{{ detail.info.theme }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议状态</span>
                    <div class="detail-content">
                        <Tag :color="status.color">{{ status.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议预定时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议室有电视</span>
                    <div class="detail-content">
                        <Tag :color="detail.info.have_tv ? 'green' : 'default'">
                            {{ detail.info.have_tv ? '有' : '没有' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议室有白板</span>
                    <div class="detail-content">
                        <Tag :color="detail.info.have_board ? 'green' : 'default'">
                            {{ detail.info.have_board ? '有' : '没有' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议室有投影仪</span>
                    <div class="detail-content">
                        <Tag :color="detail.info.have_projector ? 'green' : 'default'">
                            {{ detail.info.have_projector ? '有' : '没有' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">会议发起人</span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.created_by}`">
                            {{ detail.info.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="参会人员" class="mt-16">
            <Row class="detail-row">
                <Col :lg="4" :sm="6" :xs="12" v-for="item in detail.participant" :key="item.id">
                    <router-link :to="`/oa/hr/colleague/detail/${item.user_id}`">
                        {{ item.real_name }}
                    </router-link>
                </Col>
            </Row>
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
import { Card, Spin, Row, Col, Tag, Modal, Message, Icon } from 'view-design';
import { Header, WaterMark } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'OaMeetingDetail',
    data() {
        return {
            now: Date.now(),
            fetching: true,
            detail: {
                info: {},
                participant: []
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
                .post('/meeting/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        cancel() {
            Modal.confirm({
                title: '请确认',
                content: `确认要取消「${this.detail.info.name}」会议室预定吗？`,
                onOk: () => {
                    utils.request
                        .post('/meeting/cancel', {
                            id: this.$route.params.id,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(() => {
                            this.detail.info.cancel = 1;
                            Message.success('取消预定成功');
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
        remove_reason() {
            switch (this.detail.info.remove_reason) {
                case 1:
                    return '死亡';

                case 2:
                    return '丢失';

                case 3:
                    return '转赠';

                case 4:
                    return '行政执法机关收缴';

                default:
                    return '-';
            }
        },
        status() {
            const now = Date.now();
            let text = '已结束';
            let color = 'default';

            if (this.detail.info.cancel) {
                color = 'volcano';
                text = '已取消';
            } else {
                if (this.detail.info.start_time > now) {
                    color = 'blue';
                    text = '未开始';
                }

                if (this.detail.info.start_time <= now && this.detail.info.end_time >= now) {
                    color = 'red';
                    text = '进行中';
                }
            }

            return {
                text,
                color
            };
        },
        num() {
            return utils.order.num('MT', this.detail.info.created_at, this.detail.info.id);
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
        Icon
    }
};
</script>
