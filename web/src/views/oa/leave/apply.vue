<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Form
                :model="form"
                :rules="rules"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                class="form"
                @submit.native.prevent
            >
                <FormField prop="community_id" title="所属小区：">
                    {{ community_name }}
                </FormField>
                <FormField prop="community_id" title="请假人：">
                    {{ userInfo.real_name }}
                </FormField>
                <FormField prop="begin_date" title="请假时间：" :label="total">
                    <DatePicker
                        format="yyyy年MM月dd日"
                        style="width:100%"
                        v-model="form.begin_date"
                        :options="{ disabledDate: d => +d < Date.now() - 1000 * 60 * 60 * 24 }"
                        placeholder="请选择请假时间"
                    />
                </FormField>
                <FormField prop="total" title="请假天数：" :label="total" width="200" unit="天">
                    <Input v-model="form.total" type="number" placeholder="请输入请假天数" />
                </FormField>
                <FormField prop="reason" title="请假原因：">
                    <Input
                        type="textarea"
                        :rows="3"
                        v-model="form.reason"
                        show-word-limit
                        :maxlength="128"
                        placeholder="请输入请假原因"
                    />
                </FormField>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="submiting" @click="submit">
                        提交申请
                    </Button>
                </div>
            </Form>
        </Card>
    </WaterMark>
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

import { mapGetters } from 'vuex';
import { Header, FormField, WaterMark } from '@/components';
import { Card, Button, Input, DatePicker, Message, Form } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import moment from 'moment';

export default {
    name: 'OaLeaveApply',
    data() {
        return {
            labelWidth: 240,
            form: {
                begin_date: '',
                total: '',
                reason: ''
            },
            rules: {
                begin_date: [{ required: true, type: 'date', message: '请选择请假时间' }],
                total: [
                    { required: true, message: '请输入请假天数' },
                    { pattern: /^\d(\.\d+)?$/, message: '请输入正确的请假天数' }
                ],
                reason: [
                    { required: true, message: '请输入请假原因' },
                    { max: 128, message: '请假原因不得超过128个字' }
                ]
            },
            submiting: false
        };
    },
    mixins: [formMixin],
    methods: {
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                const data = {
                    ...this.form,
                    community_id: this.postInfo.default_community_id
                };

                data.begin_date = +data.begin_date;

                utils
                    .request({
                        url: '/leave/create',
                        data,
                        method: 'post'
                    })
                    .then(res => {
                        this.submiting = false;
                        this.$router.push(`/oa/leave/detail/${res.data.id}`);
                        Message.success('请假申请成功');
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        },
        total() {
            if (!this.form.range || !this.form.range[0]) {
                return '';
            }

            // const start = moment(this.form.range[0]);
            // const end = moment(this.form.range[1]);
            //
            // let amount = 0;
            //
            // let i = start.clone().add(1, 'day');
            //
            // while(!i.isSame(end, 'day')) {
            //     amount++;
            //     i = i.clone().add(1, 'day');
            // }
            //
            // // 8点上班 18点下班
            // let s = start.hour() < 8 ? 8 : start.hour();
            // let e = end.hour() > 18 ? 18 : end.hour();
            //
            // if (end.isSame(start, 'day')) {
            //     amount += (e - s) / 10;
            // }
            // else {
            //     if (s < 18) {
            //         amount += (18 - s) / 10;
            //     }
            //
            //     if (e > 8) {
            //         amount += (18 - e) / 10;
            //     }
            // }

            const amount = moment(this.form.range[1]).diff(moment(this.form.range[0]), 'day') + 1;

            return `共计${amount}天`;
        }
    },
    components: {
        Header,
        Card,
        Button,
        Input,
        FormField,
        Form,
        DatePicker,
        WaterMark
    }
};
</script>
