<template>
    <section class="login">
        <div class="login-form">
            <div class="logo">
                <img src="../../../assets/logo.svg" alt="logo" class="img-logo" />
                <div class="title">
                    <img src="../../../assets/logo_txt.svg" alt="e家宜业" class="text-logo" />
                    <h1><a href="https://github.com/chowa/ejyy" target="_blank">卓瓦科技开源产品</a></h1>
                </div>
            </div>

            <h2 class="slogan">助力物业服务升级，用心服务万千业主</h2>

            <Tabs class="tabs">
                <TabPane label="账号密码登录">
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
                                    <Input
                                        placeholder="验证码"
                                        size="large"
                                        v-model="form.captcha"
                                        @on-enter="submit"
                                    />
                                </Col>
                                <Col :span="10">
                                    <img :src="captchaImg" @click="getCaptcha" v-if="captchaImg" />
                                </Col>
                            </Row>
                        </FormItem>

                        <Button type="primary" long :loading="submiting" @click="submit" size="large">登录</Button>
                    </Form>
                </TabPane>
                <TabPane label="微信扫码登录">
                    <div class="wechat-qrcode">
                        <Spin size="large" fixed v-if="!ready" />
                        <WechatLogin
                            v-if="ready"
                            :appid="appid"
                            scope="snsapi_login"
                            :redirect_uri="redirect_uri"
                            :state="state"
                            theme="black"
                        />
                        <div class="expired" v-if="expired">
                            <a @click="getState">二维码已过期，点击重新获取</a>
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </div>
        <Copyright class="copyright" />
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

import { mapActions } from 'vuex';
import { Spin, Tabs, TabPane, Form, FormItem, Input, Button, Row, Col, Message } from 'view-design';
import { Copyright, WechatLogin } from '@/components';
import * as config from '@/config';
import * as utils from '@/utils';

export default {
    name: 'UserLoginMain',
    data() {
        return {
            ready: false,
            appid: config.WECHAT_WEB_APPID,
            state: null,
            redirect_uri: encodeURIComponent(
                `${config.HOST_NAME}/user/login/wechat${
                    this.$route.query.redirect ? '?redirect=' + this.$route.query.redirect : ''
                }`
            ),
            expired: false,
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
        WechatLogin,
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

        .tabs {
            .ivu-tabs-bar {
                border-bottom: none !important;
            }

            .ivu-tabs-nav {
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-around;

                .ivu-tabs-tab {
                    margin-right: 0 !important;
                }
            }

            .ivu-tabs-ink-bar {
                margin-left: 26px !important;
            }
        }

        .wechat-qrcode {
            width: 300px;
            margin: auto;
            height: 406px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;

            .expired {
                position: absolute;
                top: 47px;
                left: 9px;
                bottom: 77px;
                right: 9px;
                z-index: 100;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;

                a {
                    color: #fff;
                    cursor: pointer;
                }
            }
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
