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
                    <div class="detail-content">{{ detail.info.building_id === 0 ? '公共设施/区域' : building() }}</div>
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

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 2" title="接受工单确认">
            <Form
                :model="confirmForm"
                ref="confirmForm"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="confirmRules"
            >
                <FormField title="确认接单回复：" prop="dispose_reply">
                    <Input
                        v-model="confirmForm.dispose_reply"
                        type="textarea"
                        :rows="5"
                        show-word-limit
                        maxlength="200"
                        placeholder="非必填项，如果不能及时处理工单请填写延迟服务原因"
                    />
                </FormField>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="confirming" @click="confirm">确认工单</Button>
                </div>
            </Form>
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

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 3" title="工单完成确认">
            <Form
                :model="finishForm"
                ref="finishForm"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="finishRules"
            >
                <FormField title="维修内容：" prop="dispose_content">
                    <Input
                        v-model="finishForm.dispose_content"
                        type="textarea"
                        :rows="5"
                        show-word-limit
                        maxlength="200"
                        placeholder="请输入维修内容，替换配件等"
                    />
                </FormField>
                <FormField title="现场图片：" prop="dispose_imgs">
                    <MultipleImageUpload v-model="finishForm.dispose_imgs" dir="repair" />
                </FormField>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="finishing" @click="finish">确认完工</Button>
                </div>
            </Form>
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
import { Card, Spin, Row, Col, Tag, Button, Form, Input, Message } from 'view-design';
import { Header, Images, FormField, MultipleImageUpload, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import formMixin from '@/mixins/form';

export default {
    name: 'OaOrderRepairDetail',
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
            confirmForm: {
                dispose_reply: ''
            },
            confirmRules: {
                dispose_reply: [{ max: 200, message: '确认接单回复最多能输入200个字' }]
            },
            confirming: false,
            finishForm: {
                dispose_content: '',
                dispose_imgs: []
            },
            finishRules: {
                dispose_content: [
                    { required: true, message: '请输入维修内容' },
                    { max: 200, message: '维修内容最多能输入200个字' }
                ]
            },
            finishing: false
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    mixins: [formMixin],
    methods: {
        building() {
            return utils.building.text(this.detail.info);
        },
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/repair/my_detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        confirm() {
            this.$refs.confirmForm.validate(valid => {
                if (!valid) return;

                const data = {
                    id: this.$route.params.id,
                    community_id: this.postInfo.default_community_id,
                    ...this.confirmForm
                };
                this.confirming = true;
                utils.request
                    .post('/repair/confirm', data)
                    .then(res => {
                        this.detail.info.disposed_at = res.data.disposed_at;
                        this.detail.info.dispose_reply = this.confirmForm.dispose_reply;
                        this.detail.info.step = 3;
                        this.confirming = false;
                        Message.success('确认工单信息成功');
                    })
                    .catch(() => (this.confirming = false));
            });
        },
        finish() {
            this.$refs.finishForm.validate(valid => {
                if (!valid) return;

                const data = {
                    id: this.$route.params.id,
                    community_id: this.postInfo.default_community_id,
                    ...this.finishForm
                };
                this.finishing = true;
                utils.request
                    .post('/repair/finish', data)
                    .then(res => {
                        this.detail.info.finished_at = res.data.finished_at;
                        this.detail.info.dispose_content = this.finishForm.dispose_content;
                        this.detail.info.dispose_imgs = this.finishForm.dispose_imgs;
                        this.detail.info.step = 4;
                        this.finishing = false;
                        Message.success('确认工单完成成功');
                    })
                    .catch(() => (this.finishing = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
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
        Form,
        FormField,
        Button,
        Input,
        MultipleImageUpload,
        WaterMark
    }
};
</script>
