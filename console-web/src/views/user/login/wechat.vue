<template>
    <section class="wechat-verify">
        <div class="wechat-verify-body">
            <div class="hands">
                <span class="logo">
                    <img src="~@/assets/logo.svg" alt="logo" />
                </span>

                <b>&</b>

                <span class="logo wechat">
                    <Icon type="wechat" />
                </span>
            </div>

            <p class="loading" v-if="!error">
                微信授权认证中
                <span class="dot" />
            </p>

            <div v-if="error">
                <Alert type="error" show-icon>
                    授权失败
                    <span slot="desc">
                        {{ msg }}
                    </span>
                </Alert>

                <div class="txt-center">
                    <router-link to="/user/login">返回登陆页</router-link>
                </div>
            </div>
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
import { Icon, Alert } from 'view-design';
import * as utils from '@/utils';
import { Copyright } from '@/components';

export default {
    name: 'UserLoginWechat',
    data() {
        return {
            error: false,
            msg: null
        };
    },
    components: {
        Icon,
        Alert,
        Copyright
    },
    methods: {
        ...mapActions({
            updateUserInfo: 'common/updateUserInfo'
        })
    },
    mounted() {
        const { code, state } = this.$route.query;

        if (!code || !state) {
            return this.$router.replace('/user/login');
        }

        utils.request
            .post('/user/wechat_login', { code, state })
            .then(res => {
                utils.auth.login(res.data.userInfo.id, res.data.token);
                this.updateUserInfo(res.data);

                this.$router.replace(this.$route.query.redirect ? this.$route.query.redirect : '/');
            })
            .catch(res => {
                this.error = true;
                this.msg = res.message;
            });
    }
};
</script>

<style lang="less">
.wechat-verify {
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

    &-body {
        width: 320px;
        margin: auto;

        .hands {
            line-height: 88px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            margin-bottom: 32px;

            .logo {
                width: 88px;
                height: 88px;
                border-radius: 50%;
                text-align: center;
                display: inline-block;

                img {
                    width: 80px;
                    vertical-align: middle;
                }
            }

            .wechat {
                background: rgb(60, 176, 53);
                color: #fff;
                font-size: 42px;
            }

            b {
                font-size: 26px;
                font-weight: 400;
                color: #2d2d2d;
            }
        }

        .loading {
            font-size: 16px;
            color: #666;
            text-align: center;

            @keyframes dot {
                33% {
                    transform: translateY(-2em);
                }
                66% {
                    transform: translateY(-1em);
                }
            }
            .dot {
                display: inline-block;
                height: 1em;
                line-height: 1;
                text-align: left;
                vertical-align: -0.25em;
                overflow: hidden;

                &::before {
                    display: block;
                    content: '...\A..\A.';
                    white-space: pre-wrap;
                    animation: dot 0.8s infinite step-start both;
                }
            }
        }

        .txt-center {
            text-align: center;
            margin-top: 12px;
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
</style>
