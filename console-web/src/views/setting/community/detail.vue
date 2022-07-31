<template>
    <section>
        <Header back>
            <span slot="description">
                公司整体设置，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

        <Card dis-hover :bordered="false" title="小区信息">
            <span slot="extra">
                <a @click="goUpdate">
                    <Icon type="ios-create-outline" />
                    修改信息
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ detail.communityInfo.name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">客服电话</span>
                    <div class="detail-content">{{ detail.communityInfo.phone }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        小区地址
                    </span>
                    <div class="detail-content">
                        {{ detail.communityInfo.province }}{{ detail.communityInfo.city
                        }}{{ detail.communityInfo.district }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">创建时间</span>
                    <div class="detail-content">{{ detail.communityInfo.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        小图封面图
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.communityInfo.banner" :imgs="[detail.communityInfo.banner]" />
                        <span v-else>暂无上传</span>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="创建人信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        创建人姓名
                    </span>
                    <div class="detail-content">
                        {{ detail.creatorInfo.real_name ? detail.creatorInfo.real_name : '-' }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        创建人电话
                    </span>
                    <div class="detail-content">{{ detail.creatorInfo.phone ? detail.creatorInfo.phone : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">创建时间</span>
                    <div class="detail-content">{{ detail.creatorInfo.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        部门
                    </span>
                    <div class="detail-content">
                        {{ detail.creatorInfo.department ? detail.creatorInfo.department : '-' }}
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">工作职位</span>
                    <div class="detail-content">{{ detail.creatorInfo.job ? detail.creatorInfo.job : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        创建人头像
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching" :imgs="[detail.creatorInfo.avatar_url]" />
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="小区支持功能">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">NFC门禁</span>
                    <div class="detail-content">{{ detail.setting.access_nfc ? '支持' : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">二维码门禁</span>
                    <div class="detail-content">{{ detail.setting.access_qrcode ? '支持' : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">远程开门</span>
                    <div class="detail-content">{{ detail.setting.access_remote ? '支持' : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">装修保证金</span>
                    <div class="detail-content">{{ detail.setting.fitment_pledge ? '需要' : '不需要' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">车位绑定车辆数目</span>
                    <div class="detail-content">{{ detail.setting.carport_max_car }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="便民信息">
            <a slot="extra" @click="appendConvenient">
                <Icon type="ios-add-circle-outline" />
                添加
            </a>
            <Table stripe :columns="columns" :data="detail.convenientList" />
        </Card>

        <Modal :title="editIndex > -1 ? '更新便民信息' : '创建便民信息'" v-model="visible">
            <Form ref="form" :rules="rules" :model="form" @submit.native.prevent label-position="top">
                <FormItem prop="title" label="机构名称：">
                    <Input v-model="form.title" placeholder="请输入机构名称" />
                </FormItem>
                <FormItem prop="location" label="详细地址：">
                    <Input v-model="form.location" placeholder="请输入详细地址" />
                </FormItem>
                <FormItem prop="phone" label="联系电话：">
                    <Input v-model="form.phone" type="number" placeholder="请输入联系电话" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">确认</Button>
            </div>
        </Modal>

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

import { Card, Spin, Row, Col, Table, Icon, Form, FormItem, Message, Modal, Input, Button } from 'view-design';
import { Header, Images } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'SettingCommunityDetail',
    data() {
        return {
            now: Date.now(),
            fetching: true,
            detail: {
                communityInfo: {},
                creatorInfo: {},
                setting: {}
            },
            columns: [
                {
                    title: '机构名称',
                    minWidth: 120,
                    key: 'title'
                },
                {
                    title: '地址',
                    minWidth: 120,
                    key: 'location'
                },
                {
                    title: '联系电话',
                    minWidth: 120,
                    key: 'phone'
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 80,
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.update(p) } }, '修改'),
                            h('a', { on: { click: () => this.delete(p) } }, '删除')
                        ])
                }
            ],
            visible: false,
            submiting: false,
            editIndex: -1,
            form: {
                title: '',
                location: '',
                phone: ''
            },
            rules: {
                title: [
                    { required: true, message: '请输入机构名称' },
                    { max: 30, message: '机构名称最多输入40个字' }
                ],
                location: [
                    { required: true, message: '请输入详细地址' },
                    { max: 128, message: '详细地址最多输入128个字' }
                ],
                phone: [
                    { required: true, message: '请输入联系电话' },
                    { pattern: /^\d{11}$/, message: '请输入正确的电话号码' }
                ]
            },
            lsubmiting: false
        };
    },
    mounted() {
        utils.request.get(`/community_manage/detail/${this.$route.params.id}`).then(res => {
            this.fetching = false;
            this.detail = res.data;
        });
    },
    methods: {
        appendConvenient() {
            this.visible = true;
            this.form = {
                title: '',
                location: '',
                phone: ''
            };
            this.editIndex = -1;
            this.$refs.form.resetFields();
        },
        hideModal() {
            this.visible = false;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;
                this.submiting = true;

                if (this.editIndex > -1) {
                    utils.request
                        .post('/convenient/update', {
                            ...this.form,
                            community_id: this.$route.params.id,
                            id: this.detail.convenientList[this.editIndex].id
                        })
                        .then(() => {
                            const list = [].concat(this.detail.convenientList);
                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };

                            this.detail.convenientList = list;
                            this.submiting = false;
                            Message.success('更新便民信息成功');
                            this.hideModal();
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/convenient/create', {
                            ...this.form,
                            community_id: this.$route.params.id
                        })
                        .then(res => {
                            this.detail.convenientList.unshift({
                                ...this.form,
                                id: res.data.id
                            });
                            this.submiting = false;
                            Message.success('创建便民信息成功');
                            this.hideModal();
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        update(p) {
            this.visible = true;
            this.form = {
                title: p.row.title,
                location: p.row.location,
                phone: p.row.phone
            };
            this.editIndex = p.index;
            this.$refs.form.resetFields();
        },
        delete(p) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${p.row.title}」的信息吗？`,
                onOk: () => {
                    utils.request
                        .post('/convenient/delete', {
                            id: p.row.id,
                            community_id: this.$route.params.id
                        })
                        .then(() => {
                            this.detail.convenientList.splice(p.index, 1);
                            Message.success('删除便民信息成功');
                        })
                        .catch(() => {});
                }
            });
        },
        goUpdate() {
            this.$router.push(`/setting/community/update/${this.$route.params.id}`);
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Images,
        Table,
        Icon,
        Form,
        FormItem,
        Modal,
        Input,
        Button
    }
};
</script>
