<template>
    <section class="layout-content-header">
        <div class="layout-content-header-title">
            <slot name="title" v-if="$slots.title" />
            <template v-else>{{ location }}</template>
        </div>
        <div class="layout-content-header-description" v-if="$slots.description">
            <slot name="description" />
        </div>
        <div class="layout-content-header-nav" v-if="$slots.nav">
            <slot name="nav" />
        </div>
        <Button type="text" size="small" class="back" v-if="back" @click="go">&lt; 返回</Button>
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

import { Button } from 'view-design';

export default {
    name: 'LayoutContentHeader',
    props: {
        back: Boolean
    },
    components: {
        Button
    },
    methods: {
        go() {
            this.$router.back();
        }
    },
    computed: {
        location() {
            const ret = [];

            this.$route.matched.forEach(item => {
                ret.push(item.meta.title);
            });

            return ret.join(' / ');
        }
    }
};
</script>

<style lang="less">
.layout-content-header {
    margin: -26px -26px 26px;
    padding: 16px 32px;
    background: #fff;
    border-bottom: 1px solid #e8eaec;
    position: relative;

    &-title {
        color: #17233d;
        font-weight: 500;
        font-size: 16px;
    }

    &-description {
        margin-top: 10px;
        font-size: 12px;
    }

    &-nav {
        margin-top: 14px;
        margin-bottom: -16px;

        .ivu-tabs {
            .ivu-tabs-bar {
                border: none !important;
                margin-bottom: 0 !important;
            }
        }
    }

    .back {
        position: absolute;
        top: 13px;
        right: 20px;
    }
}

@media screen and (max-width: 480px) {
    .layout-content-header {
        margin: -12px 0 14px;
        padding: 12px 16px;

        .back {
            right: 0;
        }
    }
}
</style>
