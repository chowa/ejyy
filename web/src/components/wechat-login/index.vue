<template>
    <div>
        <iframe
            :sandbox="debug ? 'allow-scripts allow-same-origin' : 'allow-scripts allow-top-navigation'"
            scrolling="no"
            width="300"
            :height="min ? 300 : 400"
            frameBorder="0"
            allowTransparency="true"
            :src="src"
        ></iframe>
    </div>
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

export default {
    data() {
        return {
            debug: process.env.NODE_ENV === 'development'
        };
    },
    computed: {
        src() {
            return (
                'https://open.weixin.qq.com/connect/qrconnect?appid=' +
                this.appid +
                '&scope=' +
                this.scope +
                '&redirect_uri=' +
                this.redirect_uri +
                '&state=' +
                this.state +
                '&login_type=' +
                this.login_type +
                '&style=' +
                this.theme +
                '&self_redirect=' +
                this.self_redirect +
                '&href=' +
                (this.min
                    ? 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHsgZGlzcGxheTogbm9uZTt9DQouaW1wb3dlckJveCAuaW5mbyB7IGRpc3BsYXk6IG5vbmU7fQ=='
                    : this.href)
            );
        }
    },
    props: {
        //应用唯一标识，在微信开放平台提交应用审核通过后获得
        appid: String,
        //应用授权作用域，拥有多个作用域用逗号（,）分隔，网页应用目前仅填写snsapi_login即可
        scope: String,
        //重定向地址，需要进行UrlEncode
        redirect_uri: String,
        //用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数加session进行校验
        state: {
            type: String,
            default: ''
        },
        //提供"black"、"white"可选，默认为黑色文字描述。详见文档底部FAQ
        theme: {
            type: String,
            default: 'black'
        },
        // 自定义样式链接，第三方可根据实际需求覆盖默认样式。详见文档底部FAQ
        href: {
            type: String,
            default: ''
        },
        // true：手机点击确认登录后可以在 iframe 内跳转到 redirect_uri，false：手机点击确认登录后可以在 top window 跳转到 redirect_uri。默认为 false。
        self_redirect: {
            type: String,
            default: 'default'
        },
        // sdk的扩展字符串，但是在这里就默认了jssdk，暂时不建议修改
        login_type: {
            type: String,
            default: 'jssdk'
        },
        min: Boolean
    }
};
</script>
