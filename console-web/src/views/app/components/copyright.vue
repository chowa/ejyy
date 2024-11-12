<template>
    <div class="copyright">
        <a href="https://www.chowa.cn" target="_blank">
            Copyright &copy; 2020-{{ new Date().getFullYear() }} 内蒙古卓佤科技有限公司版权所有 All rights reserved。
        </a>
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
    name: 'Copyright'
};
</script>

<style lang="less">
.copyright {
    padding: 28px 0 24px 0;
    font-size: 12px;
    color: #808695;
    text-align: center;
    line-height: 1.6;

    a {
        color: #808695;

        + a {
            margin-left: 14px;
        }
    }
}

@media screen and (max-width: 576px) {
    .copyright {
        display: flex;
        flex-direction: column;

        a {
            margin-left: 0 !important;
        }
    }
}
</style>
