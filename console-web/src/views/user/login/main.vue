<template>
    <section class="login">
        <div class="login-form">
            <div class="logo">
                <img src="../../../assets/logo.svg" alt="logo" class="img-logo" />
                <div class="title">
                    <img src="../../../assets/logo_txt.svg" alt="e家宜业" class="text-logo" />
                    <h1><a href="https://github.com/chowa/ejyy" target="_blank">卓佤科技开源产品</a></h1>
                </div>
            </div>

            <h2 class="slogan">助力物业服务升级，用心服务万千业主</h2>

            <Form :model="form" ref="form" @submit.native.prevent :rules="rules">
                <FormItem prop="account">
                    <Input
                        placeholder="请输入账号"
                        prefix="ios-contact"
                        size="large"
                        @on-enter="submit"
                        v-model="form.account"
                    />
                </FormItem>
                <FormItem prop="password">
                    <Input
                        placeholder="请输入密码"
                        prefix="ios-lock"
                        size="large"
                        type="password"
                        @on-enter="submit"
                        v-model="form.password"
                    />
                </FormItem>

                <FormItem prop="captcha">
                    <Row :gutter="12">
                        <Col :span="14">
                            <Input placeholder="验证码" size="large" v-model="form.captcha" @on-enter="submit" />
                        </Col>
                        <Col :span="10">
                            <img :src="captchaImg" @click="getCaptcha" v-if="captchaImg" />
                        </Col>
                    </Row>
                </FormItem>

                <Button type="primary" long :loading="submiting" @click="submit" size="large">登录</Button>
            </Form>
        </div>
        <Copyright class="copyright" />
    </section>
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

import { mapActions } from 'vuex';
import { Spin, Tabs, TabPane, Form, FormItem, Input, Button, Row, Col, Message } from 'view-design';
import { Copyright } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'UserLoginMain',
    data() {
        return {
            form: {
                account: '',
                password: '',
                captcha: ''
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
                captcha: [
                    { required: true, message: '请输入验证码' },
                    { len: 4, message: '请输入正确的验证码' }
                ]
            },
            captchaImg: null,
            submiting: false
        };
    },
    mounted() {
        this.getCaptcha()
            .then(() => {
                this.getState();
            })
            .catch(() => {});
    },
    beforeDestroy() {
        clearTimeout(this.stateTimer);
        clearTimeout(this.capatchTimer);
    },
    methods: {
        ...mapActions({
            updateUserInfo: 'common/updateUserInfo'
        }),
        getState() {
            this.ready = false;
            this.expired = false;

            utils.request.get('/user/state').then(res => {
                this.state = res.data.state;
                this.ready = true;

                clearTimeout(this.stateTimer);

                this.stateTimer = setTimeout(() => {
                    this.expired = true;
                }, res.data.expire);
            });
        },
        getCaptcha() {
            return utils.request
                .get('/user/captcha')
                .then(res => {
                    this.captchaImg = res.data.img;

                    clearTimeout(this.capatchTimer);

                    this.capatchTimer = setTimeout(() => {
                        this.getCaptcha();
                    }, res.data.expire);
                })
                .catch(res => {
                    if (res.code !== -66) {
                        Message.warning('网速过慢，获取验证码失败');
                    }
                });
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                utils.request
                    .post('/user/account_login', { ...this.form })
                    .then(res => {
                        this.submiting = false;
                        utils.auth.login(res.data.userInfo.id, res.data.token);
                        this.updateUserInfo(res.data);
                        this.$router.replace(this.$route.query.redirect ? this.$route.query.redirect : '/');
                        Message.success('登录成功');
                    })
                    .catch(() => {
                        this.submiting = false;
                        this.getCaptcha();
                    });
            });
        }
    },
    components: {
        Spin,
        Copyright,
        Tabs,
        TabPane,
        Form,
        FormItem,
        Input,
        Button,
        Row,
        Col
    }
};
</script>

<style lang="less">
.login {
    width: 100%;
    height: 100%;
    padding-bottom: 10vh;
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
    background-image: url(~@/assets/login.jpg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &-form {
        width: 300px;

        .logo {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;

            .img-logo {
                width: 84px;
            }

            .title {
                padding-left: 24px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;

                .text-logo {
                    width: 110px;
                }

                h1 {
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 1;
                    color: #787878;
                    margin-top: 16px;
                }
            }
        }

        .slogan {
            font-size: 16px;
            padding: 14px 0 18px;
            color: #2b2b2b;
            text-align: center;
            font-weight: 400;
        }
    }

    .copyright {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 5;
    }
}

@media screen and (max-width: 576px) {
    .login {
        &-form {
            padding-top: 30px;
        }
    }
}
</style>
