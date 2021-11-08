<template>
    <div>
        <h4>采购项目（{{ index }}）信息</h4>
        <Form
            :model="form"
            ref="form"
            :label-position="mlabelPostion"
            :label-width="mlabelWidth"
            @submit.native.prevent
            :rules="rules"
        >
            <FormField title="采购物料：" prop="material_id" width="300">
                <Select v-model="form.material_id" placeholder="请选择物料" filterable>
                    <Option v-for="item in options.material" :key="item.id" :value="item.id">
                        {{ item.name }}
                    </Option>
                </Select>
            </FormField>
            <FormField title="供应商：" prop="supplier_id" width="300">
                <Select v-model="form.supplier_id" placeholder="请选择供应商" filterable>
                    <Option v-for="item in options.supplier" :key="item.id" :value="item.id">
                        {{ item.title }}
                    </Option>
                </Select>
            </FormField>
            <FormField title="采购数量：" prop="total" width="300">
                <Input v-model="form.total" placeholder="请输入采购数量" type="number" @on-change="trigger" />
            </FormField>
            <FormField title="采购总金额：" prop="fee" width="200">
                <Input v-model="form.fee" placeholder="请输入采购总金额" type="number" @on-change="trigger" />
            </FormField>
        </Form>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { FormField } from '@/components';
import { Form, Input, Select, Option } from 'view-design';
import formMixin from '@/mixins/form';

export default {
    name: 'OaPurchaseApply',
    props: {
        value: {
            type: Object,
            default: () => {
                return {};
            }
        },
        index: Number,
        options: Object
    },
    data() {
        return {
            form: {
                material_id: undefined,
                supplier_id: undefined,
                total: '',
                fee: ''
            },
            rules: {
                material_id: [{ required: true, type: 'number', message: '请选择所采购的物料' }],
                supplier_id: [{ required: true, type: 'number', message: '请选择供应商信息' }],
                total: [
                    { required: true, message: '请输入采购数量' },
                    { pattern: /^\d+$/, message: '采购数量只能为整数' }
                ],
                fee: [
                    { message: '请输入采购总金额', required: true },
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
                    material_id: cur.material_id ? cur.material_id : undefined,
                    supplier_id: cur.supplier_id ? cur.supplier_id : undefined,
                    total: cur.total ? cur.total : '',
                    fee: cur.fee ? cur.fee : ''
                };
            }
        }
    },
    components: {
        Form,
        Input,
        FormField,
        Select,
        Option
    }
};
</script>
