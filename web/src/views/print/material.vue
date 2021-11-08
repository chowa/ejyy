<template>
    <div>
        <div class="title">{{ title }}</div>
        <canvas ref="canvas" />
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

import printMixin from '@/mixins/print';
import qrcode from 'qrcode';

export default {
    name: 'PrintMaterialCode',
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
