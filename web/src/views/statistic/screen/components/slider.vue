<template>
    <div :class="['screen-silder', gutter ? 'gutter' : '']">
        <SeamlessScroll :data="list" :class-option="option" class="scroll-wrapper">
            <ul>
                <li v-for="(item, key) in list" :key="key">
                    <span>{{ item.name }} - {{ item.local }}</span>
                    <i>{{ item.created_at | mom_format }}</i>
                </li>
            </ul>
        </SeamlessScroll>
        <div class="empty" v-if="list.length === 0">
            <p>{{ empty }}</p>
        </div>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import SeamlessScroll from 'vue-seamless-scroll';

export default {
    name: 'Slider',
    props: {
        list: Array,
        empty: {
            type: String,
            default: '暂无记录'
        },
        gutter: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            option: {
                step: 0.5
            }
        };
    },
    components: {
        SeamlessScroll
    }
};
</script>

<style lang="less">
.screen-silder {
    width: 100%;
    height: 100%;
    position: relative;
    flex: auto;
    overflow: hidden;

    &.gutter {
        margin-top: -2.3vw;
        padding-top: 2.3vw;
    }

    .scroll-wrapper {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    li {
        line-height: 1.6vw;
        height: 1.6vw;
        color: #fff;
        padding: 0 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        i {
            font-style: normal;
            color: #eee;
        }
    }

    .empty {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6vw;
        color: #999;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
