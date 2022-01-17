<template>
    <div class="copyright">
        <a href="https://www.chowa.cn" target="_blank">
            Copyright &copy; 2020-{{ new Date().getFullYear() }} 内蒙古卓瓦科技有限公司版权所有 All rights reserved。
        </a>
    </div>
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
