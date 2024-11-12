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

export default {
    mounted() {
        window.addEventListener('afterprint', this.back);
    },
    beforeDestroy() {
        window.removeEventListener('afterprint', this.back);
    },
    methods: {
        print() {
            window.print();
        },
        back() {
            this.$router.back();
        }
    }
};
