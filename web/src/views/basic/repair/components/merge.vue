<template>
    <div class="repair-merge">
        <ul>
            <li v-for="item in list" :key="item.id" @click="select(item.id)">
                <Checkbox :value="result === item.id" disabled />
                <div class="info">
                    <p>工单编号：{{ num(item) }}</p>
                    <p>问题描述：{{ item.description }}</p>
                    <p>
                        维修类型：
                        <Tag :color="repairType(item).color">{{ repairType(item).text }}</Tag>
                    </p>
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
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Checkbox, Tag } from 'view-design';
import * as utils from '@/utils';

export default {
    name: 'RepairMerge',
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
        repairType(item) {
            let text = '';
            let color = '';

            switch (item.repair_type) {
                case 1:
                    text = '水暖';
                    color = 'magenta';
                    break;

                case 2:
                    text = '电路';
                    color = 'red';
                    break;

                case 3:
                    text = '门窗';
                    color = 'volcano';
                    break;

                case 4:
                    text = '公共设施';
                    color = 'gold';
                    break;
            }

            return { text, color };
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
                    text = '待工程确认';
                    color = 'purple';
                    break;

                case 3:
                    text = '待维修';
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
            return utils.order.num('R', item.created_at, item.id);
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
.repair-merge {
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
