<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="挪车信息">
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
                    <span class="detail-label">车牌号码</span>
                    <div class="detail-content">{{ detail.info.car_number }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        申请人信息
                    </span>
                    <div class="detail-content">
                        <router-link
                            :to="`/basic/owner/detail/${detail.info.wechat_mp_user_id}`"
                            v-if="userInfo.access.includes(ROLES.YZDA)"
                        >
                            {{ detail.info.wechat_mp_user_real_name }}
                        </router-link>
                        <span v-else>{{ detail.info.wechat_mp_user_real_name }}</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">原车原因</span>
                    <div class="detail-content">{{ reason }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        现场图片
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.info.live_img" :imgs="[detail.info.live_img]" />
                        <span v-else>暂无上传</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        库中是否有车辆信息
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.have_concat_info ? 'green' : 'default'">
                            {{ detail.info.have_concat_info ? '有' : '没有' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">申请时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        处理状态
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.responsed_at ? 'green' : 'default'">
                            {{ detail.info.responsed_at ? '已处理' : '未处理' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.responsed_at">
                    <span class="detail-label">
                        处理人
                    </span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.property_company_user_id}`">
                            {{ detail.info.property_company_user_real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.responsed_at">
                    <span class="detail-label">
                        处理时间
                    </span>
                    <div class="detail-content">{{ detail.info.responsed_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.responsed_at">
                    <span class="detail-label">
                        处理内容
                    </span>
                    <div class="detail-content">{{ detail.info.response_content }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="挪车电话">
            <Table stripe :columns="columns" :data="detail.concatList" />
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="处理结果" v-if="!detail.info.responsed_at">
            <Form
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="处理结果：" prop="response_content">
                    <Input
                        v-model="form.response_content"
                        type="textarea"
                        :rows="5"
                        show-word-limit
                        maxlength="200"
                        placeholder="请输入处理结果"
                    />
                </FormField>
                <div class="cw-form-actions">
                    <Button type="primary" :loading="submiting" @click="submit">确认</Button>
                </div>
            </Form>
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag, Input, Button, Table, Form } from 'view-design';
import { Header, Images, FormField, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicMoveCarDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                concatList: []
            },
            form: {
                response_content: ''
            },
            rules: {
                response_content: [
                    { required: true, message: '请输入处理结果' },
                    { max: 128, message: '处理结果最多输入128个字' },
                    { min: 5, message: '处理结果最少输入5个字' }
                ]
            },
            submiting: false,
            columns: [
                {
                    title: '车牌号码',
                    minWidth: 180,
                    key: 'car_number'
                },
                {
                    title: '联系电话',
                    minWidth: 180,
                    key: 'phone'
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

            this.fetching = true;

            utils.request
                .post('/move_car/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const data = {
                    id: this.$route.params.id,
                    community_id: this.postInfo.default_community_id,
                    ...this.form
                };

                this.submiting = true;

                utils
                    .request({
                        url: '/move_car/reply',
                        data,
                        method: 'post'
                    })
                    .then(res => {
                        this.submiting = false;
                        this.detail.info.responsed_at = res.data.responsed_at;
                        this.detail.info.response_content = this.form.response_content;
                        this.detail.info.property_company_user_id = this.userInfo.id;
                        this.detail.info.property_company_user_real_name = this.userInfo.real_name;
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
        num() {
            return utils.order.num('M', this.detail.info.created_at, this.detail.info.id);
        },
        reason() {
            switch (this.detail.info.move_reason) {
                case 1:
                    return '阻碍通行';

                case 2:
                    return '占用消防通道';

                case 3:
                    return '阻挡出入口';

                case 4:
                    return '影响施工';

                case 5:
                    return '占用车位';

                default:
                    return '';
            }
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
        Button,
        Table,
        Images,
        FormField,
        Form,
        Input,
        WaterMark
    }
};
</script>
