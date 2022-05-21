<template>
    <div class="cw-workflow-append-wrapper">
        <div class="cw-workflow-append">
            <Poptip v-model="visible" placement="right-start">
                <button type="button" class="cw-workflow-append-btn">
                    <Icon type="ios-add" />
                </button>
                <div slot="content">
                    <ul class="cw-workflow-append-case">
                        <li @click="appendNode(2)">
                            <div>
                                <Icon type="ios-medal-outline" />
                            </div>
                            <p>审批人</p>
                        </li>
                        <li @click="appendNode(3)">
                            <div>
                                <Icon type="ios-paper-plane-outline" />
                            </div>
                            <p>抄送人</p>
                        </li>
                        <li @click="appendNode(5)">
                            <div>
                                <Icon type="judge" />
                            </div>
                            <p>条件判断</p>
                        </li>
                    </ul>
                </div>
            </Poptip>
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Icon, Poptip } from 'view-design';
import {
    WORKFLOW_NODE_APPROVER,
    WORKFLOW_NODE_NOTICE,
    WORKFLOW_NODE_JUDGE,
    WORKFLOW_NODE_CONDITION
} from './structure';

export default {
    props: {
        node: Object
    },
    name: 'WorkflowAppend',
    data() {
        return {
            visible: false
        };
    },
    methods: {
        appendNode(type) {
            let data = {};

            switch (type) {
                // 审批人
                case 2:
                    data = {
                        ...WORKFLOW_NODE_APPROVER,
                        next: this.node
                    };
                    break;

                // 抄送人
                case 3:
                    data = {
                        ...WORKFLOW_NODE_NOTICE,
                        next: this.node
                    };
                    break;

                // 判断
                default:
                    data = {
                        ...WORKFLOW_NODE_JUDGE,
                        condition_list: [
                            { ...WORKFLOW_NODE_CONDITION, name: '条件1' },
                            { ...WORKFLOW_NODE_CONDITION, name: '条件2' }
                        ],
                        next: this.node
                    };
            }

            this.$emit('update:node', data);
            this.visible = false;
        }
    },
    components: {
        Icon,
        Poptip
    }
};
</script>

<style lang="less">
.cw-workflow-append {
    user-select: none;
    width: 240px;
    padding: 20px 0 32px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    flex-grow: 1;

    &-wrapper {
        position: relative;
        flex-shrink: 0;
        width: 240px;

        &:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            margin: auto;
            width: 2px;
            height: 100%;
            background-color: #cacaca;
        }
    }

    &-btn {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        width: 30px;
        height: 30px;
        background: #3296fa;
        border-radius: 50%;
        position: relative;
        border: none;
        line-height: 30px;
        color: #fff;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

        &:hover {
            transform: scale(1.1);
            box-shadow: 0 13px 27px 0 rgba(0, 0, 0, 0.1);
        }
    }

    &-case {
        display: flex;
        flex-direction: row;
        list-style: none;

        li {
            cursor: pointer;
            padding: 8px 12px;

            div {
                width: 66px;
                height: 66px;
                border: 1px solid #eee;
                border-radius: 50%;
                text-align: center;
                line-height: 66px;
                font-size: 32px;
                transition: all 0.2s;
            }

            p {
                font-size: 12px;
                margin-top: 12px;
                text-align: center;
            }

            &:nth-child(1) {
                div {
                    color: rgb(255, 148, 62);
                }
            }

            &:nth-child(2) {
                div {
                    color: rgb(50, 150, 250);
                }
            }

            &:nth-child(3) {
                div {
                    color: #19be6b;
                }
            }

            &:hover {
                &:nth-child(1) {
                    div {
                        color: #fff;
                        background-color: rgb(255, 148, 62);
                        border-color: rgb(255, 148, 62);
                    }
                }

                &:nth-child(2) {
                    div {
                        color: #fff;
                        background-color: rgb(50, 150, 250);
                        border-color: rgb(50, 150, 250);
                    }
                }

                &:nth-child(3) {
                    div {
                        color: #fff;
                        background-color: #19be6b;
                        border-color: #19be6b;
                    }
                }
            }
        }
    }
}
</style>
