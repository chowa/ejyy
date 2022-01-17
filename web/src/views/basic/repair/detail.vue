<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="报修信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">工单编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        维修地点
                    </span>
                    <div class="detail-content">
                        <span v-if="detail.info.building_id === 0">公共设施/区域</span>
                        <router-link
                            :to="`/basic/building/detail/${detail.info.building_id}`"
                            v-else-if="userInfo.access.includes(ROLES.FCDA)"
                        >
                            {{ building }}
                        </router-link>
                        <span v-else>{{ building }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">问题描述</span>
                    <div class="detail-content">{{ detail.info.description }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        维修类型
                    </span>
                    <div class="detail-content">
                        <Tag :color="repairType.color">{{ repairType.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        当前进度
                    </span>
                    <div class="detail-content">
                        <Tag :color="progress.color">{{ progress.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        现场图片
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.info.repair_imgs.length" :imgs="detail.info.repair_imgs" />
                        <span v-else>未提供</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">报修时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">业主催促</span>
                    <div class="detail-content">{{ detail.urge_total }}次</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        工单来源
                    </span>
                    <div class="detail-content">{{ detail.info.refer === 'ower' ? '业主报修' : '公司分配' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.refer === 'ower'">
                    <span class="detail-label">
                        业主姓名
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/ower/detail/${detail.referInfo.id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.referInfo.real_name }}
                        </router-link>
                        <span v-else>{{ detail.referInfo.real_name }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.refer === 'colleague'">
                    <span class="detail-label">
                        发起人信息
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.referInfo.id}`">
                            {{ detail.referInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        接收指派推送
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.dispose_subscribed ? 'success' : 'default'">
                            {{ detail.info.dispose_subscribed ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        接收接单推送
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.confrim_subscribed ? 'success' : 'default'">
                            {{ detail.info.confrim_subscribed ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        接收完工推送
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.finish_subscribed ? 'success' : 'default'">
                            {{ detail.info.finish_subscribed ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.merge_id" title="工单合并信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        合并工单
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/basic/repair/detail/${detail.info.merge_id}`">
                            点击查看
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step >= 2" title="派单信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">派单时间</span>
                    <div class="detail-content">{{ detail.info.alloted_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        派单人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.allotInfo.id}`">
                            {{ detail.allotInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        指派人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.disposedInfo.id}`">
                            {{ detail.disposedInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step >= 3" title="工单确认信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">确认时间</span>
                    <div class="detail-content">{{ detail.info.disposed_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        确认回复
                    </span>
                    <div class="detail-content">{{ detail.info.dispose_reply ? detail.info.dispose_reply : '-' }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 4" title="工单维修信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">完工时间</span>
                    <div class="detail-content">{{ detail.info.finished_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        维修内容
                    </span>
                    <div class="detail-content">
                        {{ detail.info.dispose_content ? detail.info.dispose_content : '-' }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        现场图片
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.info.dispose_imgs.length" :imgs="detail.info.dispose_imgs" />
                        <span v-else>未提供</span>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 4" title="评价信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">评价时间</span>
                    <div class="detail-content">{{ detail.info.rated_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        评价内容
                    </span>
                    <div class="detail-content">{{ detail.info.rate_content ? detail.info.rate_content : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        评价分数
                    </span>
                    <div class="detail-content">
                        <Rate :value="detail.info.rate" disabled />
                    </div>
                </Col>
            </Row>
        </Card>

        <Card
            dis-hover
            :bordered="false"
            title="工单指派"
            class="mt-16"
            v-if="detail.info.step === 1 && !detail.info.merge_id"
        >
            <Colleague v-model="dispose_user_id" />
            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="allot">确定指派</Button>
            </div>
        </Card>

        <Card
            dis-hover
            :bordered="false"
            title="工单合并"
            class="mt-16"
            v-if="detail.info.step === 1 && !detail.info.merge_id"
        >
            <RepairMerge :list="mergeOption" v-model="merge_id" />
            <div class="cw-form-actions">
                <Button type="primary" :loading="merging" @click="merge">确认合并</Button>
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
import { Card, Spin, Row, Col, Tag, Button, Message, Rate } from 'view-design';
import { Header, Images, Colleague, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import RepairMerge from './components/merge';

export default {
    name: 'BasicRepairDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                referInfo: {},
                allotInfo: null,
                disposedInfo: null
            },
            dispose_user_id: null,
            submiting: false,
            mergeOption: [],
            merge_id: null,
            merging: false
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

            this.fetching = true;

            utils.request
                .post('/repair/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;

                    if (res.data.info.step === 1 && !res.data.info.merge_id) {
                        this.fetching = true;

                        utils.request.post('/repair/merge_option', data).then(res => {
                            this.mergeOption = res.data.list;
                            this.fetching = false;
                        });
                    }
                })
                .catch(() => (this.fetching = false));
        },
        allot() {
            if (!this.dispose_user_id) {
                return Message.error('请选择工单指派人员');
            }

            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id,
                dispose_user_id: this.dispose_user_id
            };

            utils.request.post('/repair/allot', data).then(res => {
                this.submiting = false;
                this.detail.info.step = 2;
                this.detail.info.alloted_at = res.data.alloted_at;
                this.detail.allotInfo = res.data.allotInfo;
                this.detail.disposedInfo = res.data.disposedInfo;
                Message.success('指派工单成功');
            });
        },
        merge() {
            if (!this.merge_id) {
                return Message.error('请选择需要合并的工单');
            }

            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id,
                merge_id: this.merge_id
            };

            this.merging = true;

            utils.request.post('/repair/merge', data).then(() => {
                this.merging = false;
                this.detail.info.merge_id = this.merge_id;
                Message.success('工单合并成功');
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        building() {
            return utils.building.text(this.detail.info);
        },
        num() {
            return utils.order.num('R', this.detail.info.created_at, this.detail.info.id);
        },
        repairType() {
            let text = '';
            let color = '';

            switch (this.detail.info.repair_type) {
                case 1:
                    text = '水暖';
                    color = 'magenta';
                    break;

                case 2:
                    text = '电路';
                    color = 'red';
                    break;

                case 3:
                    text = '门窗';
                    color = 'volcano';
                    break;

                case 4:
                    text = '公共设施';
                    color = 'gold';
                    break;
            }

            return { text, color };
        },
        progress() {
            let text = '';
            let color = '';

            if (this.detail.info.merge_id) {
                text = '合并工单';
                color = 'cyan';
            } else {
                switch (this.detail.info.step) {
                    case 1:
                        text = '待分配工单';
                        color = 'geekblue';
                        break;

                    case 2:
                        text = '待工程确认';
                        color = 'purple';
                        break;

                    case 3:
                        text = '待维修';
                        color = 'orange';
                        break;

                    case 4:
                        text = '已完成';
                        color = 'green';
                        break;
                }
            }

            return { text, color };
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
        },
        '$route.params.id'() {
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
        Images,
        Button,
        Colleague,
        Rate,
        WaterMark,
        RepairMerge
    }
};
</script>
