<template>
    <div>
        <h4>合同项目（{{ index }}）信息</h4>
        <Form
            :model="form"
            ref="form"
            :label-position="mlabelPostion"
            :label-width="mlabelWidth"
            @submit.native.prevent
            :rules="rules"
        >
            <FormField title="项目名称：" prop="title" width="300">
                <Input v-model="form.title" placeholder="请输入项目名称" @on-change="trigger" />
            </FormField>
            <FormField title="项目备注：" prop="descritpion">
                <Input v-model="form.descritpion" type="textarea" placeholder="请输入项目备注" @on-change="trigger" />
            </FormField>
            <FormField title="项目关联房产：" prop="building_id" width="220" v-if="isOwer">
                <Select placeholder="请选择关联房产" v-model="form.building_id" @on-change="trigger">
                    <Option v-for="item in options" :key="item.building_id" :value="item.building_id">
                        {{ item | building }}
                    </Option>
                </Select>
            </FormField>
            <FormField title="项目附件：" prop="attachment_url">
                <FileUpload dir="contract" v-model="attachment" @on-change="trigger" />
            </FormField>
            <FormField title="项目费用：" prop="fee" width="140">
                <Input v-model="form.fee" placeholder="请输入项目费用" type="number" @on-change="trigger" />
            </FormField>
        </Form>
    </div>
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

import { FormField, FileUpload } from '@/components';
import { Form, Input, Select, Option } from 'view-design';
import formMixin from '@/mixins/form';

export default {
    name: 'ContractItemEditor',
    props: {
        value: {
            type: Object,
            default: () => {
                return {};
            }
        },
        options: {
            type: Array,
            default: () => {
                return [];
            }
        },
        index: Number,
        isOwer: Boolean
    },
    data() {
        const { value } = this;

        return {
            form: {
                id: value.id ? value.id : undefined,
                title: value.title ? value.title : '',
                descritpion: value.descritpion ? value.descritpion : undefined,
                building_id: value.building_id ? value.building_id : undefined,
                attachment_url: value.attachment_url ? value.attachment_url : undefined,
                attachment_name: value.attachment_name ? value.attachment_name : undefined,
                fee: value.fee ? value.fee : ''
            },
            attachment: {
                url: undefined,
                name: undefined
            },
            rules: {
                title: [
                    { required: true, message: '请输入项目名称' },
                    { max: 56, message: '项目名称不能超过56个字' }
                ],
                descritpion: [{ max: 128, message: '合同名称不能超过128个字' }],
                building_id: [{ type: 'number', message: '请选择关联房产' }],
                fee: [
                    { message: '请输入项目费用', required: true },
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
                this.$emit('input', { ...this.form });
            });
        }
    },
    watch: {
        value: {
            deep: true,
            handler(cur) {
                this.form = {
                    id: cur.id ? cur.id : undefined,
                    title: cur.title ? cur.title : '',
                    descritpion: cur.descritpion ? cur.descritpion : undefined,
                    building_id: cur.building_id ? cur.building_id : undefined,
                    attachment_url: cur.attachment_url ? cur.attachment_url : undefined,
                    attachment_name: cur.attachment_name ? cur.attachment_name : undefined,
                    fee: cur.fee ? cur.fee : ''
                };

                this.attachment = {
                    url: cur.attachment_url ? cur.attachment_url : undefined,
                    name: cur.attachment_name ? cur.attachment_name : undefined
                };
            }
        },
        attachment: {
            deep: true,
            handler(cur) {
                this.form.attachment_url = cur.url;
                this.form.attachment_name = cur.name;
            }
        }
    },
    components: {
        Form,
        Input,
        FormField,
        Select,
        Option,
        FileUpload
    }
};
</script>
