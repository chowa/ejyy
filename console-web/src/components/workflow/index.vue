<template>
    <section class="cw-workflow">
        <Button type="primary" class="cw-workflow-save-btn" :loading="submiting" @click="triggerSave">保存</Button>
        <div class="cw-workflow-zoom">
            <button :class="'cw-workflow-zoom-out' + (scale == 50 ? ' disabled' : '')" @click="setZoom(1)">-</button>
            <span>{{ scale }}%</span>
            <button :class="'cw-workflow-zoom-in' + (scale == 300 ? ' disabled' : '')" @click="setZoom(2)">+</button>
        </div>
        <div
            class="cw-workflow-drawer"
            :style="'transform: scale(' + scale / 100 + '); transform-origin: 50% 0px 0px;'"
        >
            <WorkflowNode :node.sync="node" :options="options" />
            <div class="cw-workflow-end-node" v-if="node.type === 1">
                <div class="cw-workflow-end-node-circle"></div>
                <div class="cw-workflow-end-node-text">流程结束</div>
            </div>
        </div>
    </section>
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import WorkflowNode from './node';
import { Button, Message } from 'view-design';

export default {
    name: 'Workflow',
    props: {
        flow: Object,
        options: {
            type: Object,
            default: () => {
                return {
                    // 用户身份信息
                    list: [],
                    conditions: [
                        {
                            label: '部门',
                            category: 1
                        },
                        {
                            label: '数量',
                            category: 2
                        }
                    ]
                };
            }
        },
        onSubmit: Function
    },
    data() {
        return {
            submiting: false,
            scale: 100,
            node: {}
        };
    },
    methods: {
        setZoom(type) {
            if (type == 1) {
                if (this.scale == 50) {
                    return;
                }
                this.scale -= 10;
            } else {
                if (this.scale == 300) {
                    return;
                }
                this.scale += 10;
            }
        },
        triggerSave() {
            let haveError = false;
            let haveApprover = false;

            function verifyNext(node) {
                if (node.error) {
                    haveError = true;
                }

                if (node.type === 2 && !node.error) {
                    haveApprover = true;
                }

                if (node.type === 5 && !node.error) {
                    node.condition_list.forEach(item => {
                        verifyNext(item);
                    });
                }

                if (node.next) {
                    return verifyNext(node.next);
                }
            }

            verifyNext(this.node.next);

            if (haveError) {
                return Message.error('流程存在错误，不可保存');
            }

            if (!haveApprover) {
                return Message.error('流程中必须含有一个审批节点');
            }

            this.submiting = true;

            this.onSubmit(this.node).then(() => {
                this.submiting = false;
            });
        }
    },
    watch: {
        flow: {
            deep: true,
            handler(cur) {
                this.node = cur;
            }
        }
    },
    components: {
        WorkflowNode,
        Button
    }
};
</script>

<style lang="less">
.cw-workflow {
    width: 100%;
    min-height: calc(~'100vh - 260px');
    background-color: #f5f5f7;
    position: relative;
    overflow-y: hidden;
    overflow-x: auto;

    &-save-btn {
        position: absolute !important;
        top: 34px;
        right: 40px;
        z-index: 10;
    }

    &-zoom {
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        width: 125px;
        right: 120px;
        top: 30px;
        z-index: 10;

        &-in,
        &-out {
            width: 30px;
            height: 30px;
            background: #fff;
            color: #c1c1cd;
            cursor: pointer;
            background-size: 100%;
            border: none;
            text-align: center;
            line-height: 30px;
            font-size: 20px;
            color: #666;
            transition: all 0.2s;

            &:hover {
                color: #222;
            }
        }
    }

    &-drawer {
        transform: scale(1);
        display: inline-block;
        position: relative;
        width: 100%;
        padding: 54.5px 0;
        min-width: min-content;
        transform-origin: 0 0 0;
    }

    &-end-node {
        border-radius: 50%;
        font-size: 14px;
        color: rgba(25, 31, 37, 0.4);
        text-align: left;
        font-size: 14px;

        &-circle {
            width: 10px;
            height: 10px;
            margin: auto;
            border-radius: 50%;
            background: #dbdcdc;
        }

        &-text {
            margin-top: 5px;
            text-align: center;
        }
    }
}
</style>
