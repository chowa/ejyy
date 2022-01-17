<template>
    <div class="initiate" @click="showDrawer">
        <div class="cw-workflow-node-title">
            <Icon type="md-people" />
            发起人
        </div>

        <div class="cw-workflow-node-content">
            <div class="text">
                {{ text }}
            </div>
            <Icon type="ios-arrow-forward" />
        </div>

        <Drawer
            v-model="visible"
            title="发起人设置"
            transfer
            width="360"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Colleague
                multiple
                selectDeparment
                v-model="users"
                haveData
                :listData="options.list"
                :deparment_ids.sync="deparment_ids"
            />

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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Icon, Drawer, Button } from 'view-design';
import { Colleague } from '@/components';

export default {
    name: 'InitiateNode',
    props: {
        options: Object,
        node: Object
    },
    data() {
        return {
            visible: false,
            users: [],
            deparment_ids: []
        };
    },
    methods: {
        cancel() {
            this.visible = false;
        },
        showDrawer() {
            this.visible = true;
            this.users = Array.isArray(this.node.from_user_ids) ? this.node.from_user_ids : [];
            this.deparment_ids = Array.isArray(this.node.from_deparment_ids) ? this.node.from_deparment_ids : [];
        },
        saveNode() {
            const data = {
                ...this.node,
                from_user_ids: this.users,
                from_deparment_ids: this.deparment_ids,
                error: false
            };

            this.$emit('update', data);
            this.visible = false;
        }
    },
    computed: {
        text() {
            const { node, options } = this;
            const ret = [];

            if (options && Array.isArray(options.list)) {
                options.list.forEach(user => {
                    if (Array.isArray(node.from_user_ids) && node.from_user_ids.includes(user.id)) {
                        ret.push(user.real_name);
                    }

                    if (
                        Array.isArray(node.from_deparment_ids) &&
                        node.from_deparment_ids.includes(user.department_id)
                    ) {
                        if (!ret.includes(user.department)) {
                            ret.push(user.department);
                        }
                    }
                });
            }

            if (ret.length > 0) {
                return ret.join('，');
            }

            return '全体员工';
        }
    },
    components: {
        Icon,
        Drawer,
        Colleague,
        Button
    }
};
</script>

<style lang="less">
.initiate {
    .cw-workflow-node-title {
        background: rgb(87, 106, 149);
    }
}
</style>
