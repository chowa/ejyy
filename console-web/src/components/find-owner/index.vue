<template>
    <div class="ivu-form">
        <Alert type="info" show-icon>
            业主手机号码是业主唯一身份识别标识
            <p slot="desc">
                未注册小程序的业主需先
                <a @click="showHelp">引导注册</a>
                ，手机号必须与微信绑定手机号一致。
            </p>
        </Alert>
        <Input placeholder="请输入业主手机号" v-model="phone" prefix="ios-contact" @on-enter="find" />
        <div class="cw-form-actions">
            <Button type="primary" :loading="fetching" @click="find">下一步</Button>
        </div>

        <Drawer title="业主引导注册" v-model="visible" placement="right" width="420">
            <dl class="owner-help">
                <dd>
                    <p>1).扫描下方二维码关注公众号</p>
                    <img src="~@/assets/help/oa/qrcode.jpg" width="180" />
                </dd>

                <dd>
                    <p>2).关注公众号后，点击「我是业主」、「首页」</p>
                </dd>

                <dd>
                    <p>3).请业主点击「登录」授权</p>
                    <img src="~@/assets/help/ump/login.jpg" width="240" />
                </dd>

                <dd>
                    <p>4).请业主如实完成身份信息认证</p>
                    <img src="~@/assets/help/ump/fill.jpg" width="240" />
                </dd>

                <dd>
                    <p>
                        5).业主产房关联请前往
                        <router-link to="/basic/owner/approve" v-if="userInfo.access.includes(ROLES.YZDA)">
                            业主认证
                        </router-link>
                        <span v-else>业主认证</span>
                    </p>
                </dd>
            </dl>
        </Drawer>
    </div>
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

import { mapGetters } from 'vuex';
import { Alert, Input, Button, Message, Drawer } from 'view-design';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'FindOwer',
    data() {
        return {
            phone: '',
            fetching: false,
            visible: false,
            ROLES
        };
    },
    methods: {
        find() {
            if (!/^1\d{10}$/.test(this.phone)) {
                return Message.error('请输入正确的业主手机号码');
            }

            this.fetching = true;

            utils
                .request({
                    url: '/option/owner',
                    data: {
                        phone: this.phone,
                        community_id: this.postInfo.default_community_id
                    },
                    method: 'post'
                })
                .then(res => {
                    this.$emit('on-find-owner', res.data);
                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        showHelp() {
            this.visible = true;
        }
    },
    components: {
        Alert,
        Input,
        Button,
        Drawer
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        })
    }
};
</script>

<style lang="less">
.owner-help {
    dd {
        padding-bottom: 20px;

        p {
            line-height: 30px;
            font-size: 14px;
            margin-bottom: 8px;
        }

        img {
            display: block;
            margin: auto;
        }
    }
}
</style>
