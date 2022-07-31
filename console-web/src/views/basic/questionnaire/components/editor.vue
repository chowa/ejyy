<template>
    <WaterMark class="questionnaire-editor">
        <Card dis-hover :bordered="false" title="问卷信息">
            <Form
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="统计小区：">{{ community_name }}小区</FormField>
                <FormField title="问卷标题：" prop="title">
                    <Input v-model="form.title" placeholder="请输入问卷标题" />
                </FormField>
                <FormField title="发布问卷：" prop="published">
                    <OSwitch v-model="form.published" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>
                <FormField title="截止时间：" prop="expire">
                    <DatePicker
                        v-model="form.expire"
                        placeholder="请选择截止时间"
                        :options="{ disabledDate: d => +d < Date.now() + 60 * 60 * 24 * 1000 }"
                    />
                </FormField>
            </Form>
        </Card>

        <Card dis-hover :bordered="false" title="问卷问题" class="mt-16">
            <div class="ivu-form">
                <div
                    :class="['question', index === editingIndex ? 'editing' : '']"
                    v-for="(item, index) in questions"
                    v-dragging="{ item, list: questions, group: 'questions' }"
                    :key="index"
                >
                    <div v-if="index === editingIndex">
                        <div class="title-row">
                            <span>{{ index + 1 }}.</span>
                            <Input
                                placeholder="请输入问题标题"
                                show-word-limit
                                :maxlength="128"
                                v-model="questions[index].title"
                            />
                        </div>
                        <div class="answer-row" v-for="(row, key) in item.options" :key="key">
                            <span>
                                <Radio disabled v-if="item.type === 1" />
                                <Checkbox disabled v-if="item.type === 2" />
                            </span>
                            <Input
                                placeholder="请输入问题选项"
                                show-word-limit
                                :maxlength="128"
                                v-model="questions[index].options[key]"
                            />

                            <Button shape="circle" size="small" @click="removeOption(key)" v-if="key > 1">
                                <Icon type="ios-close" />
                            </Button>
                        </div>

                        <div class="operate-box">
                            <Button type="info" size="small" shape="circle" @click="addOption">
                                添加选项
                            </Button>
                            <Button type="error" size="small" shape="circle" @click="removeQuestion">
                                删除问题
                            </Button>
                            <Button type="primary" size="small" shape="circle" @click="confirmQuestion">
                                确认问题
                            </Button>
                        </div>
                    </div>
                    <div v-else>
                        <div class="title-row">
                            <span>{{ index + 1 }}.</span>
                            {{ item.title }}
                            <span class="edit-btn" @click="editQuestion(index)">
                                <Icon type="update" />
                            </span>
                        </div>
                        <div class="answer-row" v-for="(row, key) in item.options" :key="key">
                            <span>
                                <Radio disabled v-if="item.type === 1" />
                                <Checkbox disabled v-if="item.type === 2" />
                            </span>
                            {{ row }}
                        </div>
                    </div>
                </div>
                <div class="add-btns">
                    <Button type="info" shape="circle" :disabled="editingIndex > -1" @click="addQuestion(1)">
                        <Icon type="ios-add-circle-outline" />
                        单选题
                    </Button>

                    <Button shape="circle" type="info" :disabled="editingIndex > -1" @click="addQuestion(2)">
                        <Icon type="ios-add-circle-outline" />
                        多选题
                    </Button>
                </div>
            </div>
        </Card>

        <div class="cw-form-actions">
            <Button type="primary" :loading="submiting" @click="submit">{{ update ? '修改问卷' : '发布问卷' }}</Button>
        </div>
    </WaterMark>
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

import { mapGetters } from 'vuex';
import { FormField, WaterMark } from '@/components';
import { Card, Button, Form, Input, DatePicker, Icon, Radio, Switch, Checkbox, Message, Modal } from 'view-design';
import formMixin from '@/mixins/form';

export default {
    name: 'QuestionnaireEditor',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {};
            }
        },
        update: Boolean,
        onSubmit: Function
    },
    data() {
        return {
            form: {
                title: this.detail.title ? this.detail.title : '',
                expire: this.detail.expire ? new Date(this.detail.expire) : '',
                published: this.detail.published ? this.detail.published : 0
            },
            rules: {
                published: [{ required: true, type: 'number', message: '请选择是否发布问卷' }],
                title: [
                    { required: true, message: '请输入问卷标题' },
                    { max: 56, message: '问卷标题不能超过56个字' }
                ],
                expire: [{ required: true, message: '请选择问卷截止时间' }]
            },
            questions: this.detail.questions ? this.detail.questions : [],
            submiting: false,
            // 问题逻辑
            editingIndex: -1
        };
    },
    mixins: [formMixin],
    mounted() {
        this.$dragging.$on('dragged', ({ value }) => {
            this.questions = value.list;
        });
    },
    methods: {
        addQuestion(tp) {
            this.questions.push({
                type: tp,
                title: tp === 1 ? '单选题' : '多选题',
                options: ['选项1', '选项2', '选项3', '选项4']
            });

            this.editingIndex = this.questions.length - 1;
        },
        editQuestion(index) {
            this.editingIndex = index;
        },
        removeQuestion() {
            if (this.editingIndex < 0) return;
            this.questions.splice(this.editingIndex, 1);
            this.editingIndex = -1;
        },
        confirmQuestion() {
            this.editingIndex = -1;
        },
        addOption() {
            this.questions[this.editingIndex].options.push('新增选项');
        },
        removeOption(index) {
            if (this.editingIndex < 0) return;
            if (this.questions[this.editingIndex].options.length < 2) {
                return Message.warning('一个问题至少要有两个选项');
            }

            this.questions[this.editingIndex].options.splice(index, 1);
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                if (this.editingIndex > -1) {
                    return Message.error('请先完成编辑操作');
                }

                if (this.questions.length === 0) {
                    return Message.error('问卷问题不能为空');
                }

                const cb = () => {
                    this.submiting = true;

                    const data = {
                        ...this.form,
                        questions: this.questions
                    };

                    data.expire = +data.expire;

                    this.submiting = true;

                    this.onSubmit(data).then(
                        () => {
                            this.submiting = false;
                        },
                        () => {
                            this.submiting = false;
                        }
                    );
                };

                if (this.form.published) {
                    Modal.confirm({
                        title: '确认要发布问卷吗',
                        content: '发布试卷后不允许修改问卷，请确定',
                        onOk: () => cb()
                    });
                } else {
                    cb();
                }
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        }
    },
    watch: {
        detail: {
            deep: true,
            handler(cur) {
                this.form = {
                    title: cur.title ? cur.title : '',
                    expire: cur.expire ? new Date(cur.expire) : '',
                    published: cur.published ? cur.published : 0
                };

                this.questions = cur.questions ? cur.questions : [];
            }
        }
    },
    components: {
        Card,
        Button,
        Form,
        Input,
        DatePicker,
        FormField,
        Icon,
        Radio,
        OSwitch: Switch,
        Checkbox,
        WaterMark
    }
};
</script>

<style lang="less">
.questionnaire-editor {
    .questions {
        .form-field {
            flex-direction: column;
        }
    }

    .add-btns {
        padding-top: 18px;
        display: flex;
        align-items: center;
        justify-content: center;

        button + button {
            margin-left: 16px;
        }
    }

    .question {
        padding: 12px;
        border-radius: 4px;
        cursor: move;

        .title-row {
            display: flex;
            flex-direction: row;
            line-height: 20px;
            margin-bottom: 14px;

            span {
                font-size: 14px;
                font-weight: 600;
                color: #222;
                padding-right: 10px;
            }

            .edit-btn {
                margin-left: 12px;
                font-size: 16px;
                cursor: pointer;
                color: #999;
                transition: all 0.2s;
                opacity: 0;

                &:hover {
                    color: #2d8cf0;
                }
            }
        }

        &:hover .title-row .edit-btn {
            opacity: 1;
        }

        .answer-row {
            display: flex;
            flex-direction: row;
            line-height: 20px;
            margin-bottom: 4px;

            span {
                padding-right: 4px;
            }

            button {
                margin-left: 10px;
                padding: 0;
                width: 22px;
                height: 22px;
                font-size: 18px;
                line-height: 20px;

                span {
                    padding-right: 0;
                }
            }

            .ivu-radio-disabled .ivu-radio-inner,
            .ivu-checkbox-disabled .ivu-checkbox-inner {
                border: 1px solid #dcdee2;
                background: #fff;
            }
        }

        &.editing {
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);

            .title-row,
            .answer-row {
                line-height: 32px;
                align-items: center;
            }

            .operate-box {
                padding-top: 12px;
                display: flex;
                align-items: center;
                justify-content: flex-end;

                button + button {
                    margin-left: 8px;
                }
            }
        }

        + .question {
            margin-top: 16px;
        }
    }
}
</style>
