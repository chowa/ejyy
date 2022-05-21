<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="基础信息">
            <div slot="extra">
                <a @click="goUpdate">
                    <Icon type="ios-paper-plane" />
                    更新信息
                </a>

                <a @click="reset">
                    <Icon type="ios-lock" />
                    重置密码
                </a>
            </div>
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">姓名</span>
                    <div class="detail-content">{{ detail.info.real_name ? detail.info.real_name : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        性别
                    </span>
                    <div class="detail-content">
                        <Tag :color="sex.color">{{ sex.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">身份证号</span>
                    <div class="detail-content">{{ detail.info.idcard ? detail.info.idcard : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">手机号码</span>
                    <div class="detail-content">{{ detail.info.phone ? detail.info.phone : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">登录账号</span>
                    <div class="detail-content">{{ detail.info.account ? detail.info.account : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">部门</span>
                    <div class="detail-content">{{ detail.info.department ? detail.info.department : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">岗位</span>
                    <div class="detail-content">{{ detail.info.job ? detail.info.job : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        头像
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.info.avatar_url" :imgs="[detail.info.avatar_url]" />
                        <span v-else>暂无上传</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        是否离职
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.leave_office ? 'error' : 'green'">
                            {{ detail.info.leave_office ? '已离职' : '工作中' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        是否关注公众号
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.subscribed ? 'success' : 'warning'">
                            {{ detail.info.subscribed ? '已关注' : '未关注' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">可访问小区</span>
                    <div class="detail-content">{{ access_community }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">访问权限</span>
                    <div class="detail-content">{{ detail.info.access_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">权限详细</span>
                    <div class="detail-content">{{ access }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">入职时间</span>
                    <div class="detail-content">{{ detail.info.join_company_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">账号创建时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="入职流程" class="mt-16">
            <Row class="detail-row" v-if="detail.createInfo">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        处理人员
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.createInfo.id}`">
                            {{ detail.createInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
            <Empty v-else label="未查询到流程处理人员，系统管理员会没有入职流程" />
        </Card>

        <Card dis-hover :bordered="false" title="离入职记录" class="mt-16">
            <span slot="extra">
                <a @click="updateStatus" v-if="userInfo.id !== detail.info.id">
                    {{ detail.info.leave_office ? '恢复入职' : '办理离职' }}
                </a>
            </span>
            <Table :data="detail.joinRecord" :columns="columns" />
        </Card>

        <Modal :title="`重置「${detail.info.real_name}」登录密码`" v-model="visible">
            <Form ref="form" :rules="rules" :model="form" @submit.native.prevent label-position="top">
                <FormItem label="登录密码：" prop="password">
                    <Input placeholder="请输入密码" type="password" v-model="form.password" />
                </FormItem>
                <FormItem label="确认登录密码：" prop="password2">
                    <Input placeholder="请输入密码" type="password" v-model="form.password2" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">更新</Button>
            </div>
        </Modal>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag, Table, Modal, Message, Icon, Form, FormItem, Button, Input } from 'view-design';
import { Header, Images, Empty, WaterMark } from '@/components';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaHrDetail',
    data() {
        return {
            fetching: true,
            detail: {
                info: {},
                createInfo: null,
                joinRecord: [],
                communityList: []
            },
            columns: [
                {
                    title: '操作人',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'a',
                            { on: { click: () => this.$router.push(`/oa/hr/detail/${p.row.operated_user_id}`) } },
                            p.row.real_name
                        )
                },
                {
                    title: '操作事项',
                    minWidth: 120,
                    render: (h, p) =>
                        h(Tag, { props: { color: p.row.status ? 'error' : 'green' } }, p.row.status ? '离职' : '入职')
                },
                {
                    title: '操作时间',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                }
            ],
            visible: false,
            form: {
                password: undefined,
                password2: undefined
            },
            rules: {
                password: [
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度应大于6个字符' }
                ],
                password2: [
                    { required: true, message: '请输入确认密码' },
                    { min: 6, message: '密码长度应大于6个字符' },
                    {
                        validator: (rule, val, cb) => {
                            if (val && this.form.password && val === this.form.password) {
                                cb();
                            } else {
                                cb(new Error('两次密码输入不一致'));
                            }
                        },
                        message: '两次密码输入不一致'
                    }
                ]
            },
            submiting: false
        };
    },
    mounted() {
        this.getDetail();
    },
    methods: {
        getDetail() {
            utils.request
                .get(`/hr/detail/${this.$route.params.id}`)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        goUpdate() {
            this.$router.push(`/oa/hr/update/${this.$route.params.id}`);
        },
        updateStatus() {
            Modal.confirm({
                title: '请确认',
                content: `是否要为员工${this.detail.info.real_name}办理「${
                    this.detail.info.leave_office ? '入职' : '离职'
                }」${
                    !this.detail.info.leave_office
                        ? '，请确认该员工已经处理完所有流程审批工作，如果是流程审批人请联系管理员修改'
                        : ''
                }`,
                onOk: () => {
                    const status = this.detail.info.leave_office ? 0 : 1;
                    const url = this.detail.info.leave_office ? '/hr/recover' : '/hr/leave';

                    utils.request
                        .get(`${url}/${this.detail.info.id}`)
                        .then(res => {
                            this.detail.info = {
                                ...this.detail.info,
                                leave_office: status
                            };

                            this.detail.joinRecord = [
                                {
                                    operated_user_id: this.userInfo.id,
                                    real_name: this.userInfo.real_name,
                                    status,
                                    created_at: res.data.created_at
                                }
                            ].concat(this.detail.joinRecord);
                            Message.success('操作成功');
                        })
                        .catch(() => {});
                }
            });
        },
        reset() {
            this.visible = true;
            this.$refs.form.resetFields();
        },
        hideModal() {
            this.visible = false;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const data = {
                    user_id: this.$route.params.id,
                    password: this.form.password
                };

                this.submiting = true;

                utils.request
                    .post('/hr/reset', data)
                    .then(() => {
                        this.submiting = false;
                        this.form = {
                            password: undefined,
                            password2: undefined
                        };
                        Message.success('重置登录密码成功');
                        this.hideModal();
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo'
        }),
        sex() {
            let color;
            let text;

            if (this.detail.info.gender === 1) {
                color = 'blue';
                text = '男';
            } else if (this.detail.info.gender === 2) {
                color = 'magenta';
                text = '女';
            } else {
                color = 'default';
                text = '未知';
            }

            return { color, text };
        },
        access() {
            if (!this.detail.info.content) {
                return '';
            }

            const ret = [];

            this.detail.info.content.forEach(role => {
                ret.push(utils.roleAccess.text(role));
            });

            return ret.join('，');
        },
        access_community() {
            if (!this.detail.communityList) {
                return '';
            }

            const ret = [];

            this.detail.communityList.forEach(({ name }) => {
                ret.push(name);
            });

            return ret.join('，');
        }
    },
    watch: {
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
        Empty,
        Table,
        WaterMark,
        Icon,
        Form,
        FormItem,
        Button,
        Input,
        Modal
    }
};
</script>
