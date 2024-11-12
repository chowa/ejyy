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

import { CwComponent } from '../common/component';
import $toast from '../toast/toast';

CwComponent({
    props: {
        steps: {
            type: Array,
            observer: 'resetFields'
        },
        info: Object,
        label: String,
        userId: Number
    },
    data: {
        reason: '',
        agree: 1,
        relation_user_id: null,
        relation_user_real_name: '',
        submiting: false,
        show: false
    },
    methods: {
        resetFields() {
            this.setData({
                reason: '',
                agree: 1,
                relation_user_id: null,
                relation_user_real_name: '',
                show: false,
                submiting: false
            });
        },
        doApprover(e) {
            const { reason, agree } = this.data;
            const { id } = e.currentTarget.dataset;

            this.setData({ submiting: true });
            this.$emit('approved', { node_id: id, reason, agree });
        },
        setRelationId(e) {
            const { id, name } = e.detail;

            this.setData({
                relation_user_id: id,
                relation_user_real_name: name,
                show: false
            });
        },
        bindRelation(e) {
            const { relation_user_id } = this.data;
            const { id } = e.currentTarget.dataset;

            if (!relation_user_id) {
                return $toast.fail({
                    context: this,
                    message: '请指定审批人'
                });
            }

            this.setData({ submiting: true });

            this.$emit('relationed', {
                node_id: id,
                relation_user_id
            });
        },
        onAgreeChange(e) {
            this.setData({ agree: e.detail });
        },
        onAgreeClick(e) {
            const { value } = e.currentTarget.dataset;
            this.setData({ agree: value });
        },
        showColleague() {
            this.setData({ show: true });
        },
        closeColleague() {
            this.setData({ show: false });
        }
    }
});
