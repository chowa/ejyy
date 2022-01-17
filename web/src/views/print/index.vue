<template>
    <div class="print-wrapper">
        <div :class="$route.meta.print">
            <router-view />
            <div class="print-footer">「{{ SITE_TITLE }}」智慧社区提供支持</div>
        </div>
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

import { SITE_TITLE } from '@/config';

export default {
    name: 'PrintRoutePage',
    data() {
        return {
            SITE_TITLE
        };
    }
};
</script>

<style lang="less">
.print-wrapper {
    background-color: #fff;
    position: relative;
    min-height: 100vh;
    overflow: hidden;

    @page {
        margin: 0;
    }

    // 二维码样式
    .qrcode {
        padding: 22px 18px;
        width: 256px;
        border: 1px dashed #ddd;

        .title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            line-height: 20px;
            text-align: center;
            margin-bottom: 18px;
        }

        canvas {
            margin: auto;
            width: 220px;
            height: 220px;
        }
    }

    // 通知样式
    .article {
        width: 100%;
        padding: 32px 28px;

        .title {
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }

        .to {
            font-size: 16px;
            line-height: 28px;
            color: #333;
            margin-bottom: 10px;
        }

        .section {
            text-indent: 32px;
            font-size: 16px;
            line-height: 28px;
            color: #333;
            margin-bottom: 8px;
        }

        ul {
            margin: 16px 0 16px 82px;
            list-style: none;

            li {
                font-size: 16px;
                line-height: 28px;
                color: #333;
            }
        }

        img {
            margin-left: 32px;
            margin-top: 18px;
        }

        .date {
            text-align: right;
            padding-right: 80px;
            font-size: 16px;
            line-height: 1;
            color: #333;
            margin-top: 48px;
        }

        .print-footer {
            position: absolute;
            left: 18px;
            right: 18px;
            bottom: 6px;
        }
    }

    // 收费明细样式
    .order {
        width: 100%;
        padding: 32px 28px;

        .title {
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            font-size: 14px;
            color: #333;
            border-collapse: collapse;

            td {
                line-height: 20px;
                padding: 10px 12px;
                border: 1px solid #666;
            }
        }
    }

    .print-footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        margin-top: 10px;
        height: 12px;
        font-size: 12px;
        color: #999;

        img {
            height: 12px;
            margin-left: 4px;
        }
    }
}
</style>
