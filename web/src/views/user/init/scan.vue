<template>
    <section>
        <SimpleHeader>
            <span slot="title">系统初始化</span>
        </SimpleHeader>

        <div class="wechat-register">
            <h3>管理员二维码</h3>
            <WechatLogin
                v-if="!fetching"
                :appid="appid"
                scope="snsapi_login"
                :redirect_uri="redirect_uri"
                :state="state"
                theme="black"
                min
            />

            <p>请管理员使用微信扫码此二维码，完成系统初始化。</p>
        </div>

        <Copyright />

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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Spin } from 'view-design';
import { SimpleHeader, WechatLogin, Copyright } from '@/components';
import * as utils from '@/utils';
import * as config from '@/config';

export default {
    name: 'UserInitScan',
    data() {
        return {
            fetching: true,
            appid: config.WECHAT_WEB_APPID,
            state: null,
            redirect_uri: encodeURIComponent(`${config.HOST_NAME}/user/init/fill`)
        };
    },
    mounted() {
        this.getState();
    },
    beforeDestroy() {
        clearTimeout(this.timer);
    },
    methods: {
        getState() {
            this.fetching = true;

            utils.request.get('/init/state').then(res => {
                this.fetching = false;
                this.state = res.data.state;

                this.timer = setTimeout(() => {
                    this.getState();
                }, res.data.expire);
            });
        }
    },
    components: {
        Spin,
        SimpleHeader,
        WechatLogin,
        Copyright
    }
};
</script>

<style lang="less">
.wechat-register {
    padding-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    p {
        margin-top: 20px;
    }
}
</style>
