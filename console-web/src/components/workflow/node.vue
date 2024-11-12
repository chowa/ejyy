<template>
    <section>
        <div class="cw-workflow-condition-wrapper" v-if="node.type === 5">
            <div class="cw-workflow-condition">
                <button type="button" class="cw-workflow-condition-add" @click="addCondition">添加条件</button>

                <div class="cw-workflow-condition-case" v-for="(item, key) in node.condition_list" :key="key">
                    <div class="cw-workflow-condition-item-wrapper">
                        <div :class="['cw-workflow-condition-item', item.error ? 'error' : '']">
                            <ConditionNode
                                :options="options"
                                :node="item"
                                @update="updateCondition(key, $event)"
                                :index="key"
                                :len="node.condition_list.length"
                                @sort="sortConditition(key, $event)"
                            />

                            <div class="cw-workflow-error" v-if="item.error">
                                <Icon type="ios-alert" />
                            </div>

                            <div class="cw-workflow-condition-item-remove" @click.stop="removeCondition(key)">
                                <Icon type="ios-close" />
                            </div>
                        </div>
                        <WorkflowAppend :node.sync="item.next" />
                    </div>

                    <WorkflowNode :node.sync="item.next" v-if="item.next" :options="options" />

                    <div class="top-left-cover-line" v-if="key == 0" />
                    <div class="bottom-left-cover-line" v-if="key == 0" />
                    <div class="top-right-cover-line" v-if="key == node.condition_list.length - 1" />
                    <div class="bottom-right-cover-line" v-if="key == node.condition_list.length - 1" />
                </div>
            </div>

            <WorkflowAppend :node.sync="node.next" />
        </div>
        <div class="cw-workflow-node-wrapper" v-else-if="node.type > 0 && node.type < 5">
            <div :class="nodeClasses">
                <div class="cw-workflow-node-remove" v-if="node.type !== 1" @click="removeNode">
                    <Icon type="ios-close" />
                </div>

                <div class="cw-workflow-error" v-if="node.error">
                    <Icon type="ios-alert" />
                </div>

                <InitiateNode v-if="node.type === 1" :options="options" :node="node" @update="updateNode" />
                <ApproverNode v-else-if="node.type === 2" :options="options" :node="node" @update="updateNode" />
                <NoticeNode v-else-if="node.type === 3" :options="options" :node="node" @update="updateNode" />
            </div>

            <WorkflowAppend :node.sync="node.next" />
        </div>

        <WorkflowNode :node.sync="node.next" v-if="node.next" :options="options" />
    </section>
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

import { Icon } from 'view-design';
import WorkflowAppend from './append';
import { WORKFLOW_NODE_CONDITION } from './structure';
import InitiateNode from './components/initiate';
import ApproverNode from './components/approver';
import NoticeNode from './components/notice';
import ConditionNode from './components/condition';

export default {
    props: {
        node: Object,
        options: Object
    },
    name: 'WorkflowNode',
    components: {
        Icon,
        WorkflowAppend,
        InitiateNode,
        ApproverNode,
        NoticeNode,
        ConditionNode
    },
    methods: {
        addCondition() {
            const data = { ...this.node };

            data.condition_list.push({
                ...WORKFLOW_NODE_CONDITION,
                name: `条件${data.condition_list.length + 1}`
            });

            this.$emit('update:node', data);
        },
        removeCondition(index) {
            const data = { ...this.node };

            data.condition_list.splice(index, 1);

            if (data.condition_list.length === 1) {
                if (data.condition_list[0].next) {
                    const rebuild = (node, next) => {
                        if (!node.next) {
                            return {
                                ...node,
                                next
                            };
                        } else {
                            return rebuild(node.next, next);
                        }
                    };

                    this.$emit('update:node', rebuild(data.condition_list[0].next, data.next));
                } else {
                    this.$emit('update:node', data.next);
                }
            } else {
                this.$emit('update:node', data);
            }
        },
        removeNode() {
            this.$emit('update:node', this.node.next);
        },
        updateNode(node) {
            this.$emit('update:node', node);
        },
        updateCondition(index, condition) {
            const condition_list = [].concat(this.node.condition_list);

            condition_list[index] = condition;

            this.$emit('update:node', { ...this.node, condition_list });
        },
        sortConditition(index, type) {
            const condition_list = [].concat(this.node.condition_list);

            condition_list[index] = condition_list.splice(index + type, 1, condition_list[index])[0];

            this.$emit('update:node', { ...this.node, condition_list });
        }
    },
    computed: {
        type() {
            if (this.node.type === 1) {
                return 'initiate';
            } else if (this.node.type === 2) {
                return 'approver';
            } else if (this.node.type === 3) {
                return 'notice';
            } else {
                return 'condition';
            }
        },
        titleClasses() {
            return ['cw-workflow-node-title', this.type];
        },
        nodeClasses() {
            return ['cw-workflow-node', this.node.type === 1 ? 'start' : '', this.node.error ? 'error' : ''];
        }
    }
};
</script>

<style lang="less">
.cw-workflow {
    &-node {
        display: inline-flex;
        flex-direction: column;
        position: relative;
        width: 220px;
        min-height: 72px;
        flex-shrink: 0;
        background: #fff;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);

        &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 4px;
            border: 1px solid transparent;
            pointer-events: none;
            transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        &-wrapper {
            width: 100%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 50px;
            flex-direction: column;
            position: relative;
        }

        &-title {
            display: flex;
            align-items: center;
            padding-left: 16px;
            padding-right: 30px;
            width: 100%;
            height: 24px;
            line-height: 24px;
            font-size: 12px;
            color: #fff;
            text-align: left;
            border-radius: 4px 4px 0 0;

            > .ivu-icon {
                font-size: 16px;
                margin-right: 6px;
            }
        }

        &-remove {
            display: none;
            position: absolute;
            right: 0px;
            top: 0px;
            width: 24px;
            height: 24px;
            font-size: 18px;
            color: #fff;
            text-align: center;
            line-height: 24px;
        }

        &:hover {
            &:not(.error) {
                box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);

                &:after {
                    border-color: #3296fa;
                }
            }

            .cw-workflow-node-remove {
                display: block;
            }
        }

        &.error:after {
            border-color: #f25643;
        }

        &-content {
            position: relative;
            padding: 16px;
            font-size: 14px;
        }

        .cw-workflow-node-content {
            padding-right: 30px;

            .text {
                overflow: hidden;
                text-overflow: ellipsis;
                -webkit-line-clamp: 3;
                white-space: nowrap;

                &.empty {
                    color: #999;
                }
            }

            .ivu-icon {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 14px;
                font-size: 16px;
                color: #979797;
            }
        }

        &:before {
            content: '';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 4px;
            border-style: solid;
            border-width: 8px 6px 4px;
            border-color: #cacaca transparent transparent;
            background: #f5f5f7;
        }

        &.start:before {
            content: none;
        }
    }

    &-condition {
        display: flex;
        overflow: visible;
        min-height: 180px;
        height: auto;
        border-bottom: 2px solid #ccc;
        border-top: 2px solid #ccc;
        position: relative;
        margin-top: 15px;

        &-wrapper {
            width: 100%;
            display: inline-flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-height: 270px;
        }

        &-add {
            white-space: nowrap;
            border: none;
            user-select: none;
            font-size: 12px;
            padding: 0 10px;
            height: 30px;
            line-height: 30px;
            border-radius: 15px;
            color: #3296fa;
            background: #fff;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            position: absolute;
            top: -16px;
            left: 50%;
            transform: translateX(-50%);
            transform-origin: center center;
            cursor: pointer;
            z-index: 1;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

            &:hover {
                transform: translateX(-50%) scale(1.1);
                box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
            }
        }

        &-case {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            position: relative;

            &:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                width: 2px;
                height: 100%;
                background-color: #cacaca;
            }

            .top-left-cover-line,
            .top-right-cover-line {
                position: absolute;
                height: 4px;
                width: 50%;
                background-color: #f5f5f7;
                top: -3px;
            }

            .top-left-cover-line {
                left: -1px;
            }

            .top-right-cover-line {
                right: -1px;
            }

            .bottom-left-cover-line,
            .bottom-right-cover-line {
                position: absolute;
                height: 4px;
                width: 50%;
                background-color: #f5f5f7;
                bottom: -3px;
            }

            .bottom-left-cover-line {
                left: -1px;
            }

            .bottom-right-cover-line {
                right: -1px;
            }

            .cw-workflow-node-wrapper {
                &:before,
                &:after {
                    content: '';
                    position: absolute;
                    height: 100%;
                    width: 3px;
                    background-color: #f5f5f7;
                    top: 0;
                }

                &:before {
                    left: -2px;
                }

                &:after {
                    right: -2px;
                }
            }
        }

        &-item {
            position: relative;
            width: 222px;
            min-height: 74px;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);

            &-inner {
                padding: 14px 19px;
                min-height: 74px;
            }

            &-content {
                margin-top: 10px;

                &.empty {
                    color: #999;
                }
            }

            &:after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 4px;
                border: 1px solid transparent;
                pointer-events: none;
                transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
            }

            &-wrapper {
                width: 100%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                padding-top: 30px;
                padding-right: 50px;
                padding-left: 50px;

                &:before,
                &:after {
                    content: '';
                    position: absolute;
                    height: 100%;
                    width: 3px;
                    background-color: #f5f5f7;
                    top: 0;
                }

                &:before {
                    left: -2px;
                }

                &:after {
                    right: -2px;
                }
            }

            &-remove {
                display: none;
                position: absolute;
                right: 0px;
                top: 0px;
                width: 24px;
                height: 24px;
                font-size: 18px;
                color: #999;
                text-align: center;
                line-height: 24px;
            }

            &-header {
                font-size: 12px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;

                &-name,
                &-level {
                    max-width: 100px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                &-name {
                    color: #15bc83;
                    border-bottom: 1px dashed #fff;
                }

                &-level {
                    color: #666;
                    margin-left: 8px;
                }
            }

            &-sort-left,
            &-sort-right {
                position: absolute;
                top: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #666;
                width: 10px;
                display: none;
                transition: all 0.1s;

                &:hover {
                    background-color: #efefef;
                }
            }

            &-sort-left {
                left: 0;
                border-right: 1px solid #f6f6f6;
            }

            &-sort-right {
                right: 0;
                border-left: 1px solid #f6f6f6;
            }

            &:hover {
                &:not(.error) {
                    box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);

                    &:after {
                        border-color: #3296fa;
                    }
                }

                .cw-workflow-condition-item-remove {
                    display: block;
                }

                .cw-workflow-condition-item-header-name {
                    border-color: #15bc83;
                }

                .cw-workflow-condition-item-sort-left,
                .cw-workflow-condition-item-sort-right {
                    display: flex;
                }
            }

            &.error:after {
                border-color: #f25643;
            }
        }
    }

    &-error {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(150%);
        font-size: 24px;
        color: #f25643;
    }
}
</style>
