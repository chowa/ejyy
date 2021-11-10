<template>
    <WaterMark>
        <Card dis-hover :bordered="false">
            <Alert v-if="disabled" show-icon type="error">禁止自己修改自己的人事信息！</Alert>
            <Form
                :model="form"
                :rules="rules"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                class="form"
                @submit.native.prevent
            >
                <FormField title="登录账号：" prop="account" width="300">
                    <Input placeholder="请输入账号" v-model="form.account" :readonly="update" />
                </FormField>
                <FormField title="登录密码：" prop="password" width="300" v-if="!update">
                    <Input placeholder="请输入密码" type="password" v-model="form.password" />
                </FormField>
                <FormField title="确认登录密码：" prop="password2" width="300" v-if="!update">
                    <Input placeholder="请输入密码" type="password" v-model="form.password2" />
                </FormField>
                <FormField prop="real_name" title="姓名：" width="200">
                    <Input v-model="form.real_name" placeholder="请输入您的真实姓名" />
                </FormField>
                <FormField title="身份证号码：" prop="idcard" width="300">
                    <Input v-model="form.idcard" placeholder="请输入您的身份证号码" />
                </FormField>
                <FormField prop="avatar_url" title="头像：" label="请上传200*200以上尺寸图片">
                    <AvatarCrop dir="avatar" circle v-model="form.avatar_url" />
                </FormField>
                <FormField title="手机号码：" prop="phone" width="200">
                    <Input v-model="form.phone" placeholder="请输入您的手机号码" />
                </FormField>

                <FormField title="任职部门：" prop="department_id" width="200">
                    <Select placeholder="请选择任职部门" v-model="form.department_id" filterable>
                        <Option v-for="item in options.department" :key="item.id" :value="item.id">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormField>
                <FormField title="任职岗位：" prop="job_id" width="200">
                    <Select placeholder="请选择任职岗位" v-model="form.job_id" filterable>
                        <template v-for="item in options.job">
                            <Option :key="item.id" :value="item.id" v-if="item.parent_id === form.department_id">
                                {{ item.name }}
                            </Option>
                        </template>
                    </Select>
                </FormField>
                <FormField title="访问小区：" prop="community_access" width="300">
                    <Select placeholder="请选择可访问小区" v-model="form.community_access" multiple filterable>
                        <Option
                            v-for="item in postInfo.community_list"
                            :key="item.community_id"
                            :value="item.community_id"
                        >
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormField>
                <FormField title="访问权限：" prop="access_id" width="200">
                    <Select placeholder="请选择访问权限" v-model="form.access_id" filterable>
                        <Option v-for="item in options.access" :key="item.id" :value="item.id">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormField>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="submiting" @click="submit" :disabled="disabled">
                        {{ update ? '修改人事信息' : '创建人事信息' }}
                    </Button>
                </div>
            </Form>
        </Card>

        <Spin size="large" fix v-if="fetching || getting" />
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
import { Card, Form, Input, Button, Select, Option, Spin, Alert } from 'view-design';
import { AvatarCrop, FormField, WaterMark } from '@/components';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'HrEditor',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {};
            }
        },
        update: Boolean,
        onSubmit: Function,
        fetching: Boolean
    },
    data() {
        const { detail } = this;

        return {
            getting: true,
            labelWidth: 140,
            options: {
                department: [],
                job: [],
                access: []
            },
            form: {
                account: detail.account ? detail.account : '',
                password: undefined,
                password2: undefined,
                real_name: detail.real_name ? detail.real_name : '',
                idcard: detail.idcard ? detail.idcard : undefined,
                avatar_url: detail.avatar_url ? detail.avatar_url : undefined,
                phone: detail.phone ? detail.phone : undefined,
                department_id: detail.department_id ? detail.department_id : undefined,
                job_id: detail.job_id ? detail.job_id : undefined,
                community_access: detail.community_access ? detail.community_access : [],
                access_id: detail.access_id ? detail.access_id : undefined
            },
            rules: {
                account: [
                    { required: true, message: '请输入账号' },
                    { min: 4, message: '账号长度应大于4个字符' }
                ],
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
                ],
                real_name: [
                    { required: true, message: '请输入您的真实姓名' },
                    { max: 8, message: '姓名不能超过8个字符' }
                ],
                idcard: [
                    { required: true, message: '请输入您的身份证号码' },
                    { pattern: /^\d{17}\d|x$/i, message: '请输入正确的身份证号码' }
                ],
                avatar_url: [{ required: true, message: '请上传您的头像，建议使用实拍照片' }],
                phone: [
                    { required: true, message: '请输入您的手机号码' },
                    { pattern: /^\d{11}$/, message: '请输入正确的手机号码' }
                ],
                department_id: [{ required: true, type: 'number', message: '请选择任职部门' }],
                job_id: [{ required: true, type: 'number', message: '请选择任职岗位' }],
                community_access: [{ required: true, type: 'array', message: '请选择可访问的小区' }],
                access_id: [{ required: true, type: 'number', message: '请选择访问权限' }]
            },
            submiting: false
        };
    },
    mixins: [formMixin],
    mounted() {
        utils.request.get('/hr/assign').then(res => {
            this.getting = false;
            this.options = res.data;
        });
    },
    methods: {
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    return;
                }

                const data = { ...this.form };

                delete data.password2;

                if (this.update) {
                    delete data.account;
                    delete data.password;
                }

                this.submiting = true;

                this.onSubmit(data).then(
                    () => {
                        this.submiting = false;
                    },
                    () => {
                        this.submiting = false;
                    }
                );
            });
        }
    },
    watch: {
        detail: {
            deep: true,
            handler(cur) {
                this.form = {
                    account: cur.account ? cur.account : '',
                    password: undefined,
                    password2: undefined,
                    real_name: cur.real_name ? cur.real_name : '',
                    idcard: cur.idcard ? cur.idcard : undefined,
                    avatar_url: cur.avatar_url ? cur.avatar_url : undefined,
                    phone: cur.phone ? cur.phone : undefined,
                    department_id: cur.department_id ? cur.department_id : undefined,
                    job_id: cur.job_id ? cur.job_id : undefined,
                    community_access: cur.community_access ? cur.community_access : [],
                    access_id: cur.access_id ? cur.access_id : undefined
                };
            }
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        disabled() {
            return this.detail.id ? this.detail.id === this.userInfo.id : false;
        }
    },
    components: {
        Card,
        AvatarCrop,
        Form,
        FormField,
        Input,
        Button,
        Select,
        Option,
        Spin,
        Alert,
        WaterMark
    }
};
</script>
