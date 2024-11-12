<template>
    <section class="water-mark-wrapper">
        <slot />

        <div class="water-mark" :style="styles" />
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
