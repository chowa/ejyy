<template>
    <section class="exception">
        <SimpleHeader class="exception-header" />

        <div class="exception-img">
            <img src="~@/assets/404.svg" alt="404" />
        </div>

        <div class="exception-content">
            <h1>404</h1>
            <p>抱歉，你访问的页面不存在</p>
            <Button type="primary" to="/">返回首页</Button>
        </div>

        <Copyright class="exception-copyright" />
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Button } from 'view-design';
import { SimpleHeader, Copyright } from '@/components';

export default {
    name: 'NotFound',
    components: {
        Button,
        SimpleHeader,
        Copyright
    }
};
</script>

<style lang="less">
.exception {
    display: flex;
    flex-direction: row;
    height: 100%;
    align-items: center;
    justify-content: center;
    padding-top: 90px;
    min-height: 600px;
    padding-bottom: 71px;
    position: relative;

    &-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
    }

    &-img {
        flex: 0 0 62.5%;
        width: 62.5%;
        padding-right: 152px;
        padding-left: 90px;
        zoom: 1;
        text-align: right;

        img {
            width: 100%;
            max-width: 430px;
        }
    }

    &-content {
        flex: auto;

        h1 {
            margin-bottom: 24px;
            color: #515a6e;
            font-weight: 600;
            font-size: 72px;
            line-height: 72px;
        }

        p {
            margin-bottom: 16px;
            color: #808695;
            font-size: 20px;
            line-height: 28px;
        }
    }

    &-copyright {
        position: absolute;
        right: 0;
        left: 0;
        bottom: 0;
    }
}

@media screen and (max-width: 576px) {
    .exception {
        flex-direction: column;

        &-img {
            flex: none;
            margin: 0 auto 24px;
            padding-right: 0;
            padding-left: 0;
            text-align: center;
        }

        &-content {
            text-align: center;
        }
    }
}
</style>
