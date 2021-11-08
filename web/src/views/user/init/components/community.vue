<template>
    <Card dis-hover :bordered="false" class="mt-16" title="初始化小区信息">
        <Form
            :model="form"
            ref="form"
            :label-position="mlabelPostion"
            :label-width="mlabelWidth"
            class="form"
            @submit.native.prevent
            :rules="rules"
        >
            <FormField title="小区名称：" prop="name" width="300">
                <Input v-model="form.name" placeholder="请输入小区名称" />
            </FormField>
            <FormField title="小区所在地：" prop="address">
                <AreaSelect v-model="form.address" />
            </FormField>
            <FormField title="客服电话：" prop="service_phone" width="200">
                <Input v-model="form.service_phone" placeholder="请输入客服电话" />
            </FormField>
            <FormField title="小区照片：" prop="banner" label="请上传900*506尺寸图片，用于业主端App展示">
                <ImageUpload v-model="form.banner" dir="community_banner" :width="900" :height="506" />
            </FormField>
            <FormField prop="access_nfc" title="NFC门禁：">
                <OSwitch v-model="form.access_nfc" :true-value="1" :false-value="0">
                    <span slot="open">关</span>
                    <span slot="close">开</span>
                </OSwitch>
            </FormField>
            <FormField prop="access_qrcode" title="二维码门禁：">
                <OSwitch v-model="form.access_qrcode" :true-value="1" :false-value="0">
                    <span slot="open">关</span>
                    <span slot="close">开</span>
                </OSwitch>
            </FormField>
            <FormField prop="access_remote" title="远程开门：">
                <OSwitch v-model="form.access_remote" :true-value="1" :false-value="0">
                    <span slot="open">关</span>
                    <span slot="close">开</span>
                </OSwitch>
            </FormField>
            <FormField prop="fitment_pledge" title="装修保证金：">
                <OSwitch v-model="form.fitment_pledge" :true-value="1" :false-value="0">
                    <span slot="open">关</span>
                    <span slot="close">开</span>
                </OSwitch>
            </FormField>
            <FormField prop="carport_max_car" title="车位绑定车辆数目：" width="120">
                <Input type="number" v-model="form.carport_max_car" />
            </FormField>
        </Form>
    </Card>
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

import { FormField, ImageUpload, AreaSelect } from '@/components';
import { Card, Form, Input, Switch } from 'view-design';
import formMixin from '@/mixins/form';

export default {
    name: 'UserInitCommunity',
    data() {
        return {
            labelWidth: 160,
            form: {
                name: '',
                address: [],
                service_phone: '',
                banner: '',
                access_nfc: 0,
                access_qrcode: 0,
                access_remote: 0,
                fitment_pledge: 0,
                carport_max_car: 1
            },
            rules: {
                name: [
                    { required: true, message: '请输入小区名称' },
                    { max: 12, message: '小区名称不能超过12个字' }
                ],
                address: [{ required: true, type: 'array', len: 3, message: '请选择小区所在地' }],
                service_phone: [
                    { required: true, message: '请输入小区客户电话' },
                    { pattern: /^\d{11}$/, message: '请输入正确的电话号码' }
                ],
                banner: [{ required: true, message: '请上传小区照片' }],
                access_nfc: [{ required: true, type: 'number' }],
                access_qrcode: [{ required: true, type: 'number' }],
                access_remote: [{ required: true, type: 'number' }],
                fitment_pledge: [{ required: true, type: 'number' }],
                carport_max_car: [{ required: true, pattern: /^\d+$/, message: '请输入正确的车位可绑定车辆的数目' }]
            }
        };
    },
    methods: {
        validate() {
            return new Promise(resolve => {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        resolve(this.form);
                    }
                });
            });
        }
    },
    mixins: [formMixin],
    components: {
        FormField,
        ImageUpload,
        Card,
        Form,
        AreaSelect,
        Input,
        OSwitch: Switch
    }
};
</script>
