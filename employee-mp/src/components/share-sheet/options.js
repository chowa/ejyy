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

import { CwComponent } from '../common/component';
CwComponent({
    props: {
        options: Array,
        showBorder: Boolean
    },
    methods: {
        onSelect(event) {
            const { index } = event.currentTarget.dataset;
            const option = this.data.options[index];
            this.$emit('select', Object.assign(Object.assign({}, option), { index }));
        }
    }
});
