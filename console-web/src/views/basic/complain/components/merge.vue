<template>
    <div class="complain-merge">
        <ul>
            <li v-for="item in list" :key="item.id" @click="select(item.id)">
                <Checkbox :value="result === item.id" disabled />
                <div class="info">
                    <p>工单编号：{{ num(item) }}</p>
                    <p>问题描述：{{ item.description }}</p>
                    <p>
                        反馈类型：
                        <Tag :color="complainType(item).color">{{ complainType(item).text }}</Tag>
                    </p>
                    <p>问题分类：{{ category(item) }}</p>
                    <p>
                        当前进度：
                        <Tag :color="progress(item).color">{{ progress(item).text }}</Tag>
                    </p>
                    <p>上报时间：{{ item.created_at | mom_format }}</p>
                </div>
            </li>
        </ul>

        <p v-if="list.length === 0" class="empty">没有可以合并的工单</p>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Checkbox, Tag } from 'view-design';
import * as utils from '@/utils';

export default {
    name: 'ComplainMerge',
    props: {
        value: Number,
        list: Array
    },
    data() {
        return {
            result: this.value
        };
    },
    methods: {
        select(id) {
            this.result = id;
        },
        complainType(item) {
            let text = '';
            let color = '';

            switch (item.type) {
                case 1:
                    text = '投诉';
                    color = 'magenta';
                    break;

                case 2:
                    text = '建议';
                    color = 'red';
                    break;
            }

            return { text, color };
        },
        category(item) {
            switch (item.category) {
                case 1:
                    return '卫生';
                case 2:
                    return '噪音';
                case 3:
                    return '服务态度';
                case 4:
                    return '违建';
                case 5:
                    return '占用消防通道';
                case 6:
                    return '小区设施';
                case 7:
                    return '其他';

                default:
                    return '未知';
            }
        },
        progress(item) {
            let text = '';
            let color = '';

            switch (item.step) {
                case 1:
                    text = '待分配工单';
                    color = 'geekblue';
                    break;

                case 2:
                    text = '待确认工单';
                    color = 'purple';
                    break;

                case 3:
                    text = '待处理';
                    color = 'orange';
                    break;

                case 4:
                    text = '已完成';
                    color = 'green';
                    break;
            }

            return { text, color };
        },
        num(item) {
            return utils.order.num('C', item.created_at, item.id);
        }
    },
    watch: {
        result(cur) {
            this.$emit('input', cur);
            this.$emit('on-change', cur);
        }
    },
    components: {
        Tag,
        Checkbox
    }
};
</script>

<style lang="less">
.complain-merge {
    border: 1px solid #f5f5f5;
    padding: 10px 12px;
    max-width: 320px;
    height: 380px;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    margin: auto;

    .empty {
        text-align: center;
        line-height: 340px;
        font-size: 12px;
        color: #898989;
    }

    ul {
        list-style: none;

        li {
            cursor: pointer;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            padding: 12px 0;

            .info {
                font-size: 12px;
                line-height: 20px;
                padding-left: 12px;
            }

            .ivu-checkbox-disabled .ivu-checkbox-inner {
                background-color: #fff !important;
            }

            .ivu-checkbox-wrapper-disabled,
            .ivu-checkbox-input[disabled] {
                cursor: pointer !important;
                pointer-events: none;
            }

            .ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner {
                border-color: #2d8cf0 !important;
                background-color: #2d8cf0 !important;
            }

            .ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner:after {
                border-color: #fff !important;
            }

            + li {
                border-top: 1px dashed #eee;
            }
        }
    }
}
</style>
