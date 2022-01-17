<template>
    <Timeline class="workflow-timeline">
        <TimelineItem>
            <div class="init dot" slot="dot">
                <Icon type="md-people" />
            </div>
            <div class="title">
                <router-link :to="`/hr/colleague/detail/${info.created_by}`">
                    {{ info.real_name }}
                </router-link>
                发起
            </div>
            <p class="info">{{ info.created_at | mom_format }}</p>
        </TimelineItem>
        <TimelineItem
            v-for="(item, key) in steps"
            :key="key"
            :class="[
                info.step < item.step ? 'disabled' : '',
                info.step === item.step && info.success === 0 ? 'error' : ''
            ]"
        >
            <template v-if="item.type === 2">
                <div class="approver dot" slot="dot">
                    <Icon type="approver" />
                </div>
                <div class="title">
                    <router-link :to="`/hr/colleague/detail/${item.relation_user_id}`">
                        {{ item.relation_user_name }}
                    </router-link>
                    {{ item.relation_user_id ? '负责审批' : '待指定审批人' }}
                </div>
                <!-- 当前步骤-->
                <template v-if="info.step === item.step">
                    <!-- 自己取消 -->
                    <template v-if="info.cancel === 1">
                        <p class="info">{{ info.canceled_at | mom_format }} 撤销</p>
                    </template>
                    <!-- 被驳回 -->
                    <template v-else-if="info.success === 0">
                        <p class="info">审批驳回</p>
                        <p class="info" v-if="item.refuse_reason">{{ item.refuse_reason }}</p>
                    </template>
                    <!-- 已完成 -->
                    <template v-else-if="item.finish">
                        <p class="info">{{ item.finished_at | mom_format }}</p>
                    </template>
                    <!-- 未操作 -->
                    <template v-else>
                        <Card v-if="item.relation_user_id && item.relation_user_id === userId" title="审批操作">
                            <Form class="form">
                                <FormItem>
                                    <RadioGroup v-model="form.agree">
                                        <Radio :label="1">批准</Radio>
                                        <Radio :label="0">驳回</Radio>
                                    </RadioGroup>
                                </FormItem>
                                <FormItem v-if="!form.agree">
                                    <Input
                                        type="textarea"
                                        :rows="3"
                                        v-model="form.reason"
                                        show-word-limit
                                        :maxlength="128"
                                        placeholder="请输入未批准原因"
                                    />
                                </FormItem>
                            </Form>

                            <div class="footer-btns">
                                <Button
                                    :type="form.agree ? 'primary' : 'error'"
                                    :submiting="submiting"
                                    @click="doApprover(item.id)"
                                >
                                    确认
                                </Button>
                            </div>
                        </Card>
                        <Card v-else-if="item.applicant_assign && !item.relation_user_id" title="指定审批人">
                            <Colleague v-model="relation_user_id" />
                            <div class="footer-btns">
                                <Button type="primary" :submiting="submiting" @click="bindRelation(item.id)">
                                    确认
                                </Button>
                            </div>
                        </Card>
                        <p v-else class="info">待审批</p>
                    </template>
                </template>
                <!-- 过了当前了 -->
                <template v-else-if="info.step > item.step">
                    <p class="info">{{ item.finished_at | mom_format }}</p>
                </template>
            </template>

            <template v-else-if="item.type === 3">
                <div class="notice dot" slot="dot">
                    <Icon type="ios-paper-plane-outline" />
                </div>
                <div class="title">
                    抄送：
                    <router-link :to="`/hr/colleague/detail/${item.relation_user_id}`">
                        {{ item.relation_user_name }}
                    </router-link>
                </div>
            </template>

            <template v-else-if="item.type === 4">
                <div class="judge dot" slot="dot">
                    <Icon type="judge" />
                </div>
                <div class="title">
                    {{ judge(item) }}
                </div>
            </template>
        </TimelineItem>
        <TimelineItem :class="!info.success ? 'disabled' : ''">
            <div class="end dot" slot="dot">
                <Icon type="md-checkmark" />
            </div>
            <div class="title">
                申请成功
            </div>
        </TimelineItem>
    </Timeline>
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

import {
    Card,
    Button,
    Input,
    Icon,
    Timeline,
    TimelineItem,
    Radio,
    RadioGroup,
    Form,
    FormItem,
    Message
} from 'view-design';
import { Colleague } from '@/components';

export default {
    name: 'WorkflowTimeline',
    props: {
        steps: Array,
        info: Object,
        label: String,
        userId: Number,
        onApprover: Function,
        onBindRelation: Function
    },
    data() {
        return {
            form: {
                reason: '',
                agree: 1
            },
            relation_user_id: null,
            submiting: false
        };
    },
    methods: {
        judge(item) {
            if (item.category === 1) {
                return `属于${this.info.department_name}`;
            } else if (item.category === 2) {
                switch (item.opt) {
                    case 1:
                        return `${this.label} 小于 ${item.value[0]}`;

                    case 2:
                        return `${this.label} 大于 ${item.value[0]}`;

                    case 3:
                        return `${this.label} 小于等于 ${item.value[0]}`;

                    case 4:
                        return `${this.label} 等于 ${item.value[0]}`;

                    case 5:
                        return `${this.label} 大于等于 ${item.value[0]}`;

                    case 6:
                        return `${item.value[0]} ${item.opt_first_equal ? '小于等于' : '小于'} ${this.label} ${
                            item.opt_second_equal ? '小于等于' : '小于'
                        } ${item.value[1]}`;
                }
            }
        },
        doApprover(id) {
            this.submiting = true;
            this.onApprover({ node_id: id, ...this.form }).then(() => {
                this.form = {
                    reason: '',
                    agree: 1
                };
                this.submiting = false;
            });
        },
        bindRelation(id) {
            if (!this.relation_user_id) {
                return Message.error('请指定审批人');
            }

            this.submiting = true;
            this.onBindRelation({
                node_id: id,
                relation_user_id: this.relation_user_id
            }).then(() => {
                this.submiting = false;
            });
        }
    },
    components: {
        Card,
        Button,
        Input,
        Icon,
        Timeline,
        TimelineItem,
        Radio,
        RadioGroup,
        Form,
        FormItem,
        Colleague
    }
};
</script>

<style lang="less">
.workflow-timeline {
    padding: 40px 0;

    .ivu-timeline-item {
        min-height: 60px;
        padding-bottom: 30px !important;
    }

    .ivu-timeline-item-tail {
        left: 16px !important;
    }

    .ivu-timeline-item-head-custom {
        left: 0 !important;
    }

    .ivu-timeline-item-content {
        padding: 1px 1px 10px 44px;
    }

    .title {
        margin-bottom: 8px;
    }

    .info {
        font-size: 12px;
        color: #999;
        line-height: 20px;
    }

    .dot {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 16px;
        color: #fff;
        line-height: 32px;
        text-align: center;

        &.init {
            background: #576a95;
        }

        &.approver {
            background: rgb(255, 148, 62);
        }

        &.notice {
            background: rgb(50, 150, 250);
        }

        &.judge {
            background: #19be6b;
        }

        &.end {
            background: #19be6b;
        }
    }

    .disabled {
        .dot {
            background: #ddd !important;
        }

        .title {
            color: #999 !important;
        }

        .info {
            color: #ddd !important;
        }
    }

    .error {
        .dot {
            background: #ed4014 !important;
        }

        .title,
        .info {
            color: #ed4014 !important;
        }
    }

    .form {
        padding: 0;
    }

    .footer-btns {
        display: flex;
        justify-content: flex-end;
    }
}
</style>
