<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="装修信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">装修房产</span>
                    <div class="detail-content">{{ detail.info | building(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">申请时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        业主姓名
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/owner/detail/${detail.info.wechat_mp_user_id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.info.real_name }}
                        </router-link>
                        <span v-else>{{ detail.info.real_name }}</span>
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
                        装修保证金
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.fitment_pledge ? 'magenta' : 'default'">
                            {{ detail.info.fitment_pledge ? '需要' : '不需要' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.fitment_pledge && detail.info.step >= 2">
                    <span class="detail-label">
                        保证金额
                    </span>
                    <div class="detail-content">{{ detail.info.cash_deposit | yuan }}（元）</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.fitment_pledge && detail.info.step >= 2">
                    <span class="detail-label">
                        返款银行
                    </span>
                    <div class="detail-content">{{ detail.info.return_bank }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.fitment_pledge && detail.info.step >= 2">
                    <span class="detail-label">
                        返款账户
                    </span>
                    <div class="detail-content">{{ detail.info.return_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.fitment_pledge && detail.info.step >= 2">
                    <span class="detail-label">
                        返款账号
                    </span>
                    <div class="detail-content">{{ detail.info.return_bank_id }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.step >= 3">
                    <span class="detail-label">
                        完工时间
                    </span>
                    <div class="detail-content">{{ detail.info.finished_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 1" title="准许审批">
            <Form
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                v-if="detail.info.fitment_pledge"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="保证金金额：" prop="cash_deposit" unit="分" :label="form.cash_deposit ? yuan : ''">
                    <Input type="number" placeholder="请输入保证金金额" v-model="form.cash_deposit" />
                </FormField>
                <FormField title="返款账户：" prop="return_name">
                    <Input placeholder="请输入返款账户" v-model="form.return_name" />
                </FormField>
                <FormField title="返款银行：" prop="return_bank">
                    <Input placeholder="请输入返款银行" v-model="form.return_bank" />
                </FormField>
                <FormField title="返款账号：" prop="return_bank_id">
                    <Input placeholder="请输入返款账号" v-model="form.return_bank_id" />
                </FormField>
            </Form>

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="agree">同意装修</Button>
            </div>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 3" title="装修完工验收">
            <div class="cw-form-actions">
                <Button type="primary" :loading="confirming" @click="confirm">验收合格</Button>
            </div>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step >= 2" title="许可装修审批信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">同意时间</span>
                    <div class="detail-content">{{ detail.info.agreed_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        同意审批人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.agreeUserInfo.id}`">
                            {{ detail.agreeUserInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" v-if="detail.info.step === 4" title="物业验收审批信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">确认时间</span>
                    <div class="detail-content">{{ detail.info.confirmed_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        确认审批人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.confirmUserInfo.id}`">
                            {{ detail.confirmUserInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card
            dis-hover
            :bordered="false"
            class="mt-16"
            v-if="detail.info.step === 4 && detail.info.is_return_cash_deposit && detail.info.fitment_pledge"
            title="返还装修保证金审批信息"
        >
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">返款时间</span>
                    <div class="detail-content">{{ detail.returned_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        返款审批人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.reutrnUserInfo.id}`">
                            {{ detail.reutrnUserInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card
            dis-hover
            :bordered="false"
            class="mt-16"
            v-if="detail.info.step === 4 && detail.info.fitment_pledge && !detail.info.is_return_cash_deposit"
            title="确认返还装修保证金"
        >
            <div class="cw-form-actions">
                <Button type="primary" :loading="returning" @click="doReturn">确认返还</Button>
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
import { Card, Spin, Row, Col, Tag, Form, Button, Input, Message } from 'view-design';
import { Header, FormField, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicFitmentDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                agreeUserInfo: null,
                confirmUserInfo: null,
                reutrnUserInfo: null
            },
            submiting: false,
            form: {
                cash_deposit: '',
                return_bank: '',
                return_bank_id: '',
                return_name: ''
            },
            rules: {
                cash_deposit: [
                    { required: true, message: '请输入保证金金额' },
                    { pattern: /^\d+$/, message: '请输入正确的金额，不能包含小数' }
                ],
                return_name: [
                    { required: true, message: '请输入返款账户' },
                    { max: 12, message: '返款账户最多输入12个字' }
                ],
                return_bank: [
                    { required: true, message: '请输入返款银行' },
                    { max: 20, message: '返款银行最多输入20个字' }
                ],
                return_bank_id: [
                    { required: true, message: '请输入返款账号' },
                    { max: 30, message: '返款账号最多输入20个字' }
                ]
            },
            confirming: false,
            returning: false
        };
    },
    mixins: [formMixin],
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
                .post('/fitment/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        agree() {
            const send = otherData => {
                this.submiting = true;

                const data = {
                    ...otherData,
                    id: this.$route.params.id,
                    community_id: this.postInfo.default_community_id
                };

                utils.request
                    .post('/fitment/agree', data)
                    .then(res => {
                        this.submiting = false;
                        this.detail.agreeUserInfo = res.data.agreeUserInfo;
                        this.detail.info = {
                            ...this.detail.info,
                            agreed_at: res.data.agreed_at,
                            ...this.form,
                            step: 2
                        };
                        Message.success('准许装修审批成功');
                    })
                    .catch(() => (this.submiting = false));
            };

            if (!this.detail.info.fitment_pledge) {
                return send({});
            }

            this.$refs.form.validate(valid => {
                if (!valid) return;

                send(this.form);
            });
        },
        confirm() {
            this.confirming = true;

            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/fitment/confirm', data)
                .then(res => {
                    this.confirming = false;
                    this.detail.confirmUserInfo = res.data.confirmUserInfo;
                    this.detail.info = {
                        ...this.detail.info,
                        confirmed_at: res.data.confirmed_at,
                        step: 4
                    };
                    Message.success('装修验收合格成功');
                })
                .catch(() => (this.confirming = false));
        },
        doReturn() {
            this.returning = true;

            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/fitment/return', data)
                .then(res => {
                    this.returning = false;
                    this.detail.reutrnUserInfo = res.data.reutrnUserInfo;
                    this.detail.info = {
                        ...this.detail.info,
                        returned_at: res.data.returned_at,
                        is_return_cash_deposit: 1
                    };
                    Message.success('确认返还装修保证金成功');
                })
                .catch(() => (this.returning = false));
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        progress() {
            let text = '';
            let color = '';

            switch (this.detail.info.step) {
                case 1:
                    text = '业主申请';
                    color = 'geekblue';
                    break;

                case 2:
                    text = '准许装修';
                    color = 'purple';
                    break;

                case 3:
                    text = '装修完工';
                    color = 'orange';
                    break;

                case 4:
                    text = '物业确认';
                    color = 'green';
                    break;
            }

            return { text, color };
        },
        yuan() {
            return utils.payment.yuan(this.form.cash_deposit) + '元';
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
        FormField,
        Form,
        Button,
        Input,
        WaterMark
    }
};
</script>
