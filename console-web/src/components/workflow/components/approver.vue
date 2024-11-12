<template>
    <div class="approver" @click="showDrawer">
        <div class="cw-workflow-node-title">
            <Icon type="approver" />
            审批人
        </div>

        <div class="cw-workflow-node-content">
            <div :class="textClass">
                {{ text }}
            </div>
            <Icon type="ios-arrow-forward" />
        </div>

        <Drawer
            v-model="visible"
            title="审批人设置"
            transfer
            width="360"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <RadioGroup v-model="applicant_assign" class="cw-workflow-radio">
                <Radio :label="0">指定成员</Radio>
                <Radio :label="1">发起人自行选择</Radio>
            </RadioGroup>

            <Colleague v-model="user_id" haveData :listData="options.list" v-if="!applicant_assign" />

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

import { Icon, Drawer, Button, Radio, RadioGroup, Message } from 'view-design';
import { Colleague } from '@/components';

export default {
    name: 'ApproverNode',
    props: {
        options: Object,
        node: Object
    },
    data() {
        return {
            visible: false,
            user_id: undefined,
            applicant_assign: 0
        };
    },
    methods: {
        cancel() {
            this.visible = false;
        },
        showDrawer() {
            this.visible = true;
            this.user_id = this.node.relation_user_id;
            this.applicant_assign = this.node.applicant_assign ? 1 : 0;
        },
        saveNode() {
            if (!this.applicant_assign && !this.user_id) {
                return Message.error('必须指定审批人');
            }

            const data = {
                ...this.node,
                relation_user_id: this.applicant_assign ? null : this.user_id,
                applicant_assign: this.applicant_assign,
                error: false
            };

            this.$emit('update', data);

            this.visible = false;
        }
    },
    computed: {
        text() {
            const { node, options } = this;

            if (!node.applicant_assign && !node.relation_user_id) {
                return '未指定审批人';
            } else if (!node.applicant_assign && node.relation_user_id) {
                let user = {};
                if (options && Array.isArray(options.list)) {
                    options.list.every(item => {
                        if (item.id === node.relation_user_id) {
                            user = item;
                            return false;
                        }
                        return true;
                    });
                }

                return `${user.real_name} ${user.department}-${user.job}`;
            } else {
                return '发起人自行指定';
            }
        },
        textClass() {
            const { node } = this;

            return ['text', !node.applicant_assign && !node.relation_user_id ? 'empty' : ''];
        }
    },
    components: {
        Icon,
        Drawer,
        Colleague,
        Button,
        Radio,
        RadioGroup
    }
};
</script>

<style lang="less">
.approver {
    .cw-workflow-node-title {
        background: rgb(255, 148, 62);
    }
}

.cw-workflow-radio .ivu-radio-wrapper {
    font-size: 12px;
}
</style>
