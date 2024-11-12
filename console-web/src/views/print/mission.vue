<template>
    <div>
        <div class="title">{{ title }}巡检点</div>
        <canvas ref="canvas" />
    </div>
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

import printMixin from '@/mixins/print';
import qrcode from 'qrcode';

export default {
    name: 'PrintMissionCode',
    data() {
        return {
            code: '',
            title: ''
        };
    },
    mixins: [printMixin],
    created() {
        this.code = this.$route.query.code;
        this.title = this.$route.query.title;
    },
    watch: {
        code(cur) {
            qrcode.toCanvas(this.$refs.canvas, cur, {
                width: 220,
                height: 220,
                margin: 0
            });

            this.print();
        }
    }
};
</script>
