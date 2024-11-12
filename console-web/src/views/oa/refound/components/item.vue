<template>
    <div>
        <h4>报销项目（{{ index }}）信息</h4>
        <Form
            :model="form"
            ref="form"
            :label-position="mlabelPostion"
            :label-width="mlabelWidth"
            @submit.native.prevent
            :rules="rules"
        >
            <FormField title="花销用途：" prop="reason" width="300">
                <Input v-model="form.reason" placeholder="请输入花销用途" @on-change="trigger" />
            </FormField>
            <FormField title="发票代码：" prop="code" width="300">
                <Input v-model="form.code" placeholder="请输入发票代码" @on-change="trigger" />
            </FormField>
            <FormField title="发票号码：" prop="num" width="300">
                <Input v-model="form.num" placeholder="请输入发票号码" @on-change="trigger" />
            </FormField>
            <FormField title="开票日期：" prop="date" width="300">
                <DatePicker
                    v-model="form.date"
                    :options="{ disabledDate: d => d > Date.now() }"
                    placeholder="请输入开票日期"
                    @on-change="trigger"
                />
            </FormField>
            <FormField title="电子发票：" prop="attachment_url">
                <ImageUpload dir="refound" v-model="form.attachment_url" @on-change="trigger" />
            </FormField>
            <FormField title="报销金额：" prop="fee" width="200">
                <Input v-model="form.fee" placeholder="请输入报销金额" type="number" @on-change="trigger" />
            </FormField>
        </Form>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { FormField, ImageUpload } from '@/components';
import { Form, Input, DatePicker } from 'view-design';
import formMixin from '@/mixins/form';

export default {
    name: 'OaRefoundItem',
    props: {
        value: {
            type: Object,
            default: () => {
                return {};
            }
        },
        index: Number
    },
    data() {
        return {
            form: {
                reason: '',
                code: '',
                num: '',
                date: '',
                attachment_url: '',
                fee: ''
            },
            rules: {
                reason: [
                    { required: true, message: '请输入花销用途' },
                    { max: 56, message: '花销用途不能超过56个字' }
                ],
                code: [
                    { required: true, message: '请输入发票代码' },
                    { max: 56, message: '发票代码不能超过56个字' }
                ],
                num: [
                    { required: true, message: '请输入发票号码' },
                    { max: 56, message: '发票号码不能超过56个字' }
                ],
                date: [{ required: true, type: 'date', message: '请选择开票日期' }],
                attachment_url: [{ required: true, max: 128, message: '请上传电子发票' }],
                fee: [
                    { message: '请输入报销金额', required: true },
                    { message: '请输入正确的金额', pattern: /^\d+(\.\d+)?$/ }
                ]
            }
        };
    },
    mixins: [formMixin],
    methods: {
        validate(cb) {
            this.$refs.form.validate(cb);
        },
        trigger() {
            this.$nextTick(() => {
                this.$emit('input', { ...this.form, date: +this.form.date });
            });
        }
    },
    watch: {
        value: {
            deep: true,
            handler(cur) {
                this.form = {
                    reason: cur.reason ? cur.reason : '',
                    code: cur.code ? cur.code : '',
                    num: cur.num ? cur.num : '',
                    date: cur.date ? (typeof cur.date === 'number' ? new Date(cur.date) : cur.date) : '',
                    attachment_url: cur.attachment_url ? cur.attachment_url : '',
                    fee: cur.fee ? cur.fee : ''
                };
            }
        }
    },
    components: {
        Form,
        Input,
        FormField,
        ImageUpload,
        DatePicker
    }
};
</script>
