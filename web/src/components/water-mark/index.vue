<template>
    <section class="water-mark-wrapper">
        <slot />

        <div class="water-mark" :style="styles" />
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

import { mapGetters } from 'vuex';

export default {
    name: 'WaterMark',
    computed: {
        ...mapGetters({
            waterMark: 'common/waterMark'
        }),
        styles() {
            return [
                'background-size: 332px',
                'background-repeat: repeat',
                `background-image: ${this.waterMark ? `url(${this.waterMark})` : 'none'}`
            ].join(';');
        }
    }
};
</script>

<style lang="less">
.water-mark-wrapper {
    position: relative;

    .water-mark {
        z-index: 9;
        position: absolute;
        left: 0;
        top: 60px;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }
}
</style>
