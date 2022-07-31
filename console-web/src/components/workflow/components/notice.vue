<template>
    <div class="notice" @click="showDrawer">
        <div class="cw-workflow-node-title">
            <Icon type="ios-paper-plane-outline" />
            抄送人
        </div>

        <div class="cw-workflow-node-content">
            <div :class="textClass">
                {{ text }}
            </div>
            <Icon type="ios-arrow-forward" />
        </div>

        <Drawer
            v-model="visible"
            title="抄送人设置"
            transfer
            width="360"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Colleague v-model="user_id" haveData :listData="options.list" />

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
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Icon, Drawer, Button, Message } from 'view-design';
import { Colleague } from '@/components';

export default {
    name: 'NoticeNode',
    props: {
        options: Object,
        node: Object
    },
    data() {
        return {
            visible: false,
            user_id: undefined
        };
    },
    methods: {
        cancel() {
            this.visible = false;
        },
        showDrawer() {
            this.visible = true;
            this.user_id = this.node.relation_user_id;
        },
        saveNode() {
            if (!this.applicant_assign && !this.user_id) {
                return Message.error('必须指定审批人');
            }

            const data = {
                ...this.node,
                relation_user_id: this.user_id,
                error: false
            };

            this.$emit('update', data);

            this.visible = false;
        }
    },
    computed: {
        text() {
            const { node, options } = this;

            if (!node.relation_user_id) {
                return '未指定抄送人';
            }

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
        },
        textClass() {
            const { node } = this;

            return ['text', !node.relation_user_id ? 'empty' : ''];
        }
    },
    components: {
        Icon,
        Drawer,
        Button,
        Message,
        Colleague
    }
};
</script>

<style lang="less">
.notice {
    .cw-workflow-node-title {
        background: rgb(50, 150, 250);
    }
}
</style>
