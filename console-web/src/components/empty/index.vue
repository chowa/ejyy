<template>
    <div class="cw-empty">
        {{ label }}
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

export default {
    name: 'Empty',
    props: {
        label: String
    }
};
</script>

<style lang="less">
.cw-empty {
    text-align: center;
    font-size: 12px;
    color: #999;
    line-height: 40px;
}
</style>
