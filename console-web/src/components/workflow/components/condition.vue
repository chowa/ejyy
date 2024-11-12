<template>
    <div class="cw-workflow-condition-item-inner" @click="showDrawer">
        <div class="cw-workflow-condition-item-header">
            <div class="cw-workflow-condition-item-header-name" v-if="!editing" @click.stop="showUpdateName">
                {{ node.name }}
            </div>
            <div class="cw-workflow-condition-item-header-level" v-if="!editing">优先级{{ index + 1 }}</div>
            <Input
                placeholder="请输入条件名称"
                @click.native.stop
                v-else
                v-model="name"
                @on-enter="updateName"
                size="small"
            />
        </div>

        <div :class="['cw-workflow-condition-item-content', isEmpty ? 'empty' : '']">
            {{ text }}
        </div>

        <div class="cw-workflow-condition-item-sort-left" v-if="index !== 0" @click.stop="moveLeft">&lt;</div>
        <div class="cw-workflow-condition-item-sort-right" v-if="index !== len - 1" @click.stop="moveRight">&gt;</div>

        <Drawer
            v-model="visible"
            title="条件设置"
            transfer
            width="460"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <RadioGroup v-model="category" class="cw-workflow-radio">
                <Radio v-for="item in options.conditions" :key="item.category" :label="item.category">
                    {{ item.label }}
                </Radio>
            </RadioGroup>

            <div v-if="category === 1">
                <ul class="cw-workflow-condition-choice-list">
                    <li v-for="item in deparments" :key="item.id" @click="setDeparment(item.id)">
                        <Checkbox size="small" :value="deparment_id === item.id" disabled />
                        <span>{{ item.name }}</span>
                    </li>
                </ul>
            </div>
            <div v-if="category === 2">
                <div class="cw-workflow-condition-number">
                    <Row :gutter="opt !== 6 ? 10 : 0">
                        <Col :span="opt !== 6 ? 8 : 24">
                            <Select v-model="opt" placeholder="判断逻辑">
                                <Option :value="1">小于</Option>
                                <Option :value="2">大于</Option>
                                <Option :value="3">小于等于</Option>
                                <Option :value="4">等于</Option>
                                <Option :value="5">大于等于</Option>
                                <Option :value="6">介于两个数之间</Option>
                            </Select>
                        </Col>
                        <Col :span="16" v-if="opt !== 6">
                            <Input v-model="value[0]" placeholder="请输入整数" />
                        </Col>
                    </Row>
                    <Row :gutter="6" v-if="opt === 6" class="computed">
                        <Col :span="7">
                            <Input v-model="value[0]" placeholder="请输入整数" />
                        </Col>
                        <Col :span="4">
                            <Select v-model="first_equal">
                                <Option :value="0">&lt;</Option>
                                <Option :value="1">≤</Option>
                            </Select>
                        </Col>
                        <Col :span="2">
                            数值
                        </Col>
                        <Col :span="4">
                            <Select v-model="second_equal">
                                <Option :value="0">&lt;</Option>
                                <Option :value="1">≤</Option>
                            </Select>
                        </Col>
                        <Col :span="7">
                            <Input v-model="value[1]" placeholder="请输入整数" />
                        </Col>
                    </Row>
                </div>
            </div>

            <div class="cw-drawer-footer">
                <Button @click="cancel">取消</Button>
                <Button type="primary" @click="saveNode">确定</Button>
            </div>
        </Drawer>
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

import { Input, Drawer, RadioGroup, Radio, Button, Checkbox, Select, Option, Row, Col, Message } from 'view-design';

export default {
    name: 'ConditionNode',
    props: {
        options: Object,
        node: Object,
        index: Number,
        len: Number
    },
    data() {
        return {
            visible: false,
            editing: false,
            name: '',
            category: undefined,
            deparment_id: undefined,
            opt: undefined,
            first_equal: 0,
            second_equal: 0,
            value: [null, null]
        };
    },
    methods: {
        showUpdateName() {
            this.editing = true;
            this.name = this.node.name;
        },
        updateName() {
            if (!this.name) {
                return Message.error('条件名称不能为空');
            }
            if (this.name.lenght > 56) {
                return Message.error('条件名称长度不能超过56个字');
            }

            this.editing = false;
            this.$emit('update', {
                ...this.node,
                name: this.name
            });
        },
        moveLeft() {
            this.$emit('sort', -1);
        },
        moveRight() {
            this.$emit('sort', 1);
        },
        showDrawer() {
            this.visible = true;
            this.opt = this.node.opt;
            this.first_equal = this.node.opt_first_equal;
            this.second_equal = this.node.opt_second_equal;
            this.value = this.node.value;
            this.deparment_id = this.node.value[0];
            this.category = this.node.category;
        },
        cancel() {
            this.visible = false;
        },
        saveNode() {
            if (this.category === 1) {
                if (!this.deparment_id) {
                    return Message.error('请选择归属部门');
                }
            } else {
                if (this.opt !== 6 && !/^\d+$/.test(this.value[0])) {
                    return Message.error('数量必须输入整数');
                }
                if (this.opt === 6) {
                    if (!/^\d+$/.test(this.value[0]) || !/^\d+$/.test(this.value[1])) {
                        return Message.error('数量必须输入整数');
                    }

                    if (this.value[1] < this.value[0]) {
                        return Message.error('大小关系错误');
                    }
                }
            }

            this.$emit('update', {
                ...this.node,
                category: this.category,
                opt: this.opt,
                opt_first_equal: this.first_equal,
                opt_second_equal: this.second_equal,
                value: this.category === 1 ? [this.deparment_id] : this.value.map(val => parseInt(val, 10)),
                error: false
            });

            this.visible = false;
        },
        setDeparment(id) {
            this.deparment_id = id;
        }
    },
    computed: {
        deparments() {
            const ret = [];
            const exist = [];

            this.options.list.forEach(item => {
                if (exist.indexOf(item.department_id) > -1) {
                    return;
                }

                exist.push(item.department_id);
                ret.push({
                    name: item.department,
                    id: item.department_id
                });
            });

            return ret;
        },
        text() {
            if (this.node.category === 1) {
                if (!this.node.value[0]) {
                    return '未设置条件';
                }

                const index = this.deparments.findIndex(item => item.id === this.node.value[0]);

                return `属于${this.deparments[index].name}`;
            } else if (this.node.category === 2) {
                if (this.node.opt !== 6 && this.node.value[0] === undefined) {
                    return '未设置条件';
                }

                if (this.node.opt === 6 && this.node.value[0] === undefined && this.node.value[1] === undefined) {
                    return '未设置条件';
                }

                const pos = this.options.conditions.findIndex(item => item.category === this.node.category);
                const label = this.options.conditions[pos].label;

                switch (this.node.opt) {
                    case 1:
                        return `${label} 小于 ${this.node.value[0]}`;

                    case 2:
                        return `${label} 大于 ${this.node.value[0]}`;

                    case 3:
                        return `${label} 小于等于 ${this.node.value[0]}`;

                    case 4:
                        return `${label} 等于 ${this.node.value[0]}`;

                    case 5:
                        return `${label} 大于等于 ${this.node.value[0]}`;

                    case 6:
                        return `${this.node.value[0]} ${this.node.opt_first_equal ? '小于等于' : '小于'} ${label} ${
                            this.node.opt_second_equal ? '小于等于' : '小于'
                        } ${this.node.value[1]}`;
                }
            }

            return '未设置条件';
        },
        isEmpty() {
            if (!this.node.category) {
                return true;
            }

            if (this.node.category === 1) {
                if (!this.node.value[0]) {
                    return true;
                }
            } else if (this.node.category === 2) {
                if (this.node.opt !== 6 && this.node.value[0] === undefined) {
                    return true;
                }

                if (this.node.opt === 6 && this.node.value[0] === undefined && this.node.value[1] === undefined) {
                    return true;
                }
            }

            return false;
        }
    },
    components: {
        Input,
        Drawer,
        Button,
        Radio,
        RadioGroup,
        Checkbox,
        Select,
        Option,
        Row,
        Col
    }
};
</script>

<style lang="less">
.cw-workflow-condition-choice-list {
    list-style: none;
    padding-top: 20px;

    li {
        line-height: 30px;
        font-size: 12px;
        cursor: pointer;

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
    }
}

.cw-workflow-condition-number {
    padding-top: 20px;
    font-size: 12px;

    .computed {
        margin-top: 12px;
        line-height: 32px;
    }
}
</style>
