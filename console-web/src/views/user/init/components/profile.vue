<template>
    <Card dis-hover :bordered="false" title="个人基本资料">
        <Form
            :model="form"
            :rules="rules"
            ref="form"
            :label-position="mlabelPostion"
            :label-width="mlabelWidth"
            class="form"
            @submit.native.prevent
        >
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
            <FormField title="登录账号：" prop="account" width="300">
                <Input placeholder="请输入账号" v-model="form.account" />
            </FormField>
            <FormField title="登录密码：" prop="password" width="300">
                <Input placeholder="请输入密码" type="password" v-model="form.password" />
            </FormField>
            <FormField title="确认登录密码：" prop="password2" width="300">
                <Input placeholder="请输入密码" type="password" v-model="form.password2" />
            </FormField>
        </Form>
    </Card>
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

import { Card, Form, Input } from 'view-design';
import { AvatarCrop, FormField } from '@/components';
import formMixin from '@/mixins/form';

export default {
    name: 'UserInitProfile',
    data() {
        return {
            labelWidth: 160,
            form: {
                real_name: '',
                idcard: undefined,
                avatar_url: undefined,
                phone: undefined,
                account: undefined,
                password: undefined,
                password2: undefined
            },
            rules: {
                real_name: [
                    { required: true, message: '请输入您的真实姓名' },
                    { max: 8, message: '姓名不能超过8个字符' }
                ],
                idcard: [
                    { required: true, message: '请输入您的身份证号码' },
                    { pattern: /^\d{17}\d|x$/i, message: '请输入正确的身份证号码' }
                ],
                avatar_url: [
                    {
                        required: true,
                        pattern: /^\/avatar\/[a-z0-9]{32}\.(jpg|jpeg|png)$/,
                        message: '请上传您的头像，建议使用实拍照片'
                    }
                ],
                phone: [
                    { required: true, message: '请输入您的手机号码' },
                    { pattern: /^\d{11}$/, message: '请输入正确的手机号码' }
                ],
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
                ]
            }
        };
    },
    mixins: [formMixin],
    methods: {
        validate() {
            return new Promise(resolve => {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        resolve(this.form);
                    }
                });
            });
        }
    },
    components: {
        Card,
        AvatarCrop,
        Form,
        FormField,
        Input
    }
};
</script>
