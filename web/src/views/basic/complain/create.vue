<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="投诉来源" content="来自业主或公司派遣" />
                <Step title="投诉信息" content="录入投诉详细信息" />
                <Step title="创建成功" content="工单创建成功" />
            </Steps>

            <div v-if="step === 0" class="ivu-form">
                <RadioGroup v-model="refer">
                    <Radio label="ower">业主报修</Radio>
                    <Radio label="colleague">公司派遣</Radio>
                </RadioGroup>
                <FindOwer v-if="refer === 'ower'" class="mt-16" @on-find-ower="onFindOwer" />
                <div class="cw-form-actions" v-else>
                    <Button type="primary" @click="nextStep">下一步</Button>
                </div>
            </div>

            <Form
                v-if="step === 1"
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="业主姓名：" v-if="refer === 'ower'">
                    {{ owerInfo.real_name }}
                </FormField>
                <FormField title="反馈类型：" prop="type">
                    <Select v-model="form.type" placeholder="请选择反馈类型" filterable>
                        <Option :value="1">投诉</Option>
                        <Option :value="1">建议</Option>
                    </Select>
                </FormField>
                <FormField title="反馈分类：" prop="category">
                    <Select v-model="form.category" placeholder="请选择反馈分类">
                        <Option :value="1">卫生</Option>
                        <Option :value="2">噪音</Option>
                        <Option :value="3">服务态度</Option>
                        <Option :value="4">违建</Option>
                        <Option :value="5">占用消防通道</Option>
                        <Option :value="6">小区设施</Option>
                        <Option :value="7">其他</Option>
                    </Select>
                </FormField>

                <FormField title="问题描述：" prop="description">
                    <Input
                        v-model="form.description"
                        type="textarea"
                        :rows="5"
                        show-word-limit
                        maxlength="200"
                        placeholder="请输入问题描述"
                    />
                </FormField>
                <FormField title="现场图片：" prop="complain_imgs">
                    <MultipleImageUpload v-model="form.complain_imgs" dir="repair" />
                </FormField>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>

            <Result title="工单创建成功" v-if="step === 2">
                <div slot="extra">
                    <p>请及时指派人员反馈。</p>
                    <p v-if="refer === 'ower'">请注意保护业主隐私。</p>
                </div>

                <div slot="actions">
                    <Button @click="goDetail" type="primary">查看工单信息</Button>
                </div>
            </Result>
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, Result, FormField, MultipleImageUpload, WaterMark, FindOwer } from '@/components';
import { Card, Button, Input, Radio, RadioGroup, Steps, Step, Select, Option, Form } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicRepairCreate',
    data() {
        return {
            step: 0,
            refer: 'ower',
            owerInfo: {},
            form: {
                type: '',
                category: '',
                description: '',
                complain_imgs: []
            },
            rules: {
                type: [{ required: true, message: '请选择反馈类型' }],
                category: [{ required: true, message: '请选择反馈分类' }],
                description: [
                    { required: true, message: '请输入问题描述' },
                    { max: 200, message: '问题描述最多输入200个字' },
                    { min: 5, message: '问题描述最少输入5个字' }
                ]
            },
            insertId: null,
            submiting: false
        };
    },
    mixins: [formMixin],
    methods: {
        building(record) {
            return utils.building.text(record);
        },
        preStep() {
            this.step--;
        },
        onFindOwer(data) {
            this.owerInfo = data;
            this.step++;
        },
        nextStep() {
            this.step++;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const data = {
                    ...this.form,
                    community_id: this.postInfo.default_community_id
                };

                if (this.refer === 'ower') {
                    data['wechat_mp_user_id'] = this.owerInfo.id;
                }

                this.submiting = true;

                utils
                    .request({
                        url: '/complain/create',
                        data,
                        method: 'post'
                    })
                    .then(res => {
                        this.submiting = false;
                        this.insertId = res.data.id;
                        this.step++;
                    })
                    .catch(() => (this.submiting = false));
            });
        },
        goDetail() {
            this.$router.push(`/basic/complain/detail/${this.insertId}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    components: {
        FindOwer,
        Header,
        Card,
        Button,
        Input,
        Result,
        Radio,
        RadioGroup,
        Steps,
        Step,
        Select,
        Option,
        FormField,
        Form,
        MultipleImageUpload,
        WaterMark
    }
};
</script>
