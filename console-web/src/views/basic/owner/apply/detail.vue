<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="申请信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">申请小区</span>
                    <div class="detail-content">{{ detail.info.community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        业主姓名
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/basic/owner/detail/${detail.info.wechat_mp_user_id}`">
                            {{ detail.info.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">申请住宅信息</span>
                    <div class="detail-content">{{ detail.info.house ? detail.info.house : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">申请车位信息</span>
                    <div class="detail-content">{{ detail.info.carport ? detail.info.carport : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        申请仓房信息
                    </span>
                    <div class="detail-content">{{ detail.info.warehouse ? detail.info.warehouse : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        接受推送
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.subscribed ? 'success' : 'default'">
                            {{ detail.info.subscribed ? '是' : '否' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        认证进度
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.replied ? 'success' : 'default'">
                            {{ detail.info.replied ? '已处理' : '未处理' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">申请时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="认证结果" class="mt-16" v-if="detail.info.replied">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        认证结果
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.success ? 'success' : 'error'">
                            {{ detail.info.success ? '成功' : '失败' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">答复内容</span>
                    <div class="detail-content">{{ detail.info.reply_content }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        处理人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.replied_by}`">
                            {{ detail.info.replied_real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">处理时间</span>
                    <div class="detail-content">{{ detail.info.replied_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>
        <Card dis-hover :bordered="false" title="认证处理" class="mt-16" v-else>
            <Form
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="认证结果：" prop="success">
                    <RadioGroup v-model="form.success">
                        <Radio :label="1">成功</Radio>
                        <Radio :label="0">失败</Radio>
                    </RadioGroup>
                </FormField>
                <FormField title="认证答复：" prop="reply_content">
                    <Input
                        v-model="form.reply_content"
                        type="textarea"
                        :rows="5"
                        show-word-limit
                        maxlength="128"
                        placeholder="请输入认证结果答复原因，认证失败尽量写明原因"
                    />
                </FormField>
                <FormField title="业主房产：" prop="building_ids" v-if="form.success">
                    <Select v-model="form.building_ids" multiple placeholder="请选择业主房产" filterable>
                        <Option v-for="item in buildingList" :key="item.building_id" :value="item.building_id">
                            {{ item | building }}
                        </Option>
                    </Select>
                </FormField>
            </Form>

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="submit">提交</Button>
            </div>
        </Card>

        <Card
            dis-hover
            :bordered="false"
            title="认证房产"
            class="mt-16"
            v-if="detail.info.replied && detail.info.success"
        >
            <Table :data="detail.buildings" :columns="buildings" />
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import {
    Card,
    Spin,
    Row,
    Col,
    Tag,
    Form,
    Select,
    Option,
    Button,
    RadioGroup,
    Radio,
    Input,
    Table,
    Message
} from 'view-design';
import { Header, FormField, WaterMark } from '@/components';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import ROLES from '@/constants/role';

export default {
    name: 'BasicOwerApplyDetail',
    data() {
        return {
            fetching: true,
            detail: {
                info: {},
                buildings: []
            },
            form: {
                success: 0,
                reply_content: '',
                building_ids: []
            },
            rules: {
                success: [{ required: true, message: '请选择认证结果' }],
                reply_content: [
                    { required: true, message: '请输入认证答复内容' },
                    { max: 128, message: '认证答复不能超过128个字' }
                ],
                building_ids: [{ required: true, type: 'array', message: '请选择业主所有房产' }]
            },
            buildingList: [],
            submiting: false,
            buildings: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('B', p.row.created_at, p.row.building_id))
                },
                {
                    title: '详细',
                    minWidth: 120,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.FCDA)) {
                            return h(
                                'a',
                                { on: { click: () => this.$router.push(`/building/detail/${p.row.building_id}`) } },
                                utils.building.text(p.row)
                            );
                        } else {
                            return h('span', utils.building.text(p.row));
                        }
                    }
                },
                {
                    title: '建筑面积(㎡)',
                    minWidth: 120,
                    key: 'construction_area'
                },
                {
                    title: '首次认证类型',
                    minWidth: 60,
                    render: (h, p) => {
                        let color;
                        let text;

                        if (p.row.authenticated_type === 1) {
                            color = 'volcano';
                            text = '实名信息自行关联';
                        } else if (p.row.authenticated_type === 2) {
                            color = 'orange';
                            text = '物业公司现场认证';
                        } else {
                            color = 'red';
                            text = '家人APP认证关联';
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '状态',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.status ? 'green' : 'purple' } },
                            p.row.status ? '绑定中' : '已解绑'
                        )
                }
            ]
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

            utils.request
                .post('/owner/apply_detail', data)
                .then(res => {
                    this.detail = res.data;

                    if (!res.data.info.replied) {
                        utils
                            .request({
                                url: '/option/building',
                                data: {
                                    community_id: this.postInfo.default_community_id
                                },
                                method: 'post'
                            })
                            .then(res => {
                                this.buildingList = res.data.list;
                                this.fetching = false;
                            })
                            .catch(() => (this.fetching = false));
                    } else {
                        this.fetching = false;
                    }
                })
                .catch(() => (this.fetching = false));
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                utils
                    .request({
                        url: '/owner/apply_reply',
                        data: {
                            id: this.$route.params.id,
                            community_id: this.postInfo.default_community_id,
                            ...this.form
                        },
                        method: 'post'
                    })
                    .then(res => {
                        Message.success('认证成功');
                        this.detail = {
                            info: {
                                ...this.detail.info,
                                replied: 1,
                                replied_at: res.data.replied_at,
                                replied_by: this.userInfo.id,
                                replied_real_name: this.userInfo.real_name,
                                reply_content: this.form.reply_content,
                                success: this.form.success
                            },
                            buildings: res.data.buildings
                        };
                        this.submiting = false;
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
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
        Form,
        Select,
        Option,
        Button,
        Input,
        RadioGroup,
        Radio,
        FormField,
        Table,
        WaterMark
    }
};
</script>
