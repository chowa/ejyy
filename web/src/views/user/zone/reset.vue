<template>
    <section>
        <Header />
        <Card dis-hover :bordered="false">
            <Form
                :model="form"
                :rules="rules"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                class="form"
                @submit.native.prevent
            >
                <FormField title="登录密码：" prop="password" width="300">
                    <Input placeholder="请输入密码" type="password" v-model="form.password" />
                </FormField>
                <FormField title="确认登录密码：" prop="password2" width="300">
                    <Input placeholder="请输入密码" type="password" v-model="form.password2" />
                </FormField>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="submiting" @click="submit">
                        修改密码
                    </Button>
                </div>
            </Form>
        </Card>
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Card, Message, Form, Input, Button } from 'view-design';
import { Header, FormField } from '@/components';
import formMixin from '@/mixins/form';
import * as utils from '@/utils';

export default {
    name: 'UserZoneReset',
    data() {
        return {
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
    mixins: [formMixin],
    methods: {
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                utils.request
                    .post('/user/reset', { password: this.form.password })
                    .then(() => {
                        this.submiting = false;
                        Message.success('修改密码成功，请重新登录');
                        utils.auth.logout();
                        this.$router.replace('/user/login');
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    components: {
        Card,
        Form,
        FormField,
        Input,
        Button,
        Header,
        Message
    }
};
</script>
