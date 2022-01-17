<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="业主信息" content="通过手机号查找业主" />
                <Step title="车辆信息" content="录入车辆信息" />
                <Step title="录入成功" content="添加车辆信息成功" />
            </Steps>

            <FindOwer v-if="step === 0" @on-find-ower="onFindOwer" />

            <Form
                v-if="step === 1"
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="业主姓名：">
                    {{ owerInfo.real_name }}
                </FormField>
                <FormField title="绑定房产：" prop="building_id">
                    <Select v-model="form.building_id" placeholder="请选择车位信息">
                        <Option
                            v-for="row in [].concat(owerInfo.carports, owerInfo.garages)"
                            :key="row.building_id"
                            :value="row.building_id"
                        >
                            {{ row | building }}
                        </Option>
                    </Select>
                </FormField>
                <FormField title="是否新能源：" prop="is_new_energy">
                    <OSwitch v-model="form.is_new_energy" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>
                <FormField title="车辆类型：" prop="car_type">
                    <RadioGroup v-model="form.car_type">
                        <Radio :label="1">7座及以下小客车/小型货车</Radio>
                        <Radio :label="2">7座以上客车/中大型货车</Radio>
                    </RadioGroup>
                </FormField>

                <FormField title="车牌号码：" prop="car_number">
                    <Input v-model="form.car_number" placeholder="请输入车牌号码" />
                </FormField>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>

            <Result title="录入车辆成功" v-if="step === 2">
                <div slot="extra">
                    <p>提醒业主勿占用他人车位。</p>
                    <p>提醒业主停车不能占用消防通道。</p>
                </div>

                <div slot="actions">
                    <Button @click="goDetail" type="primary">查看车辆信息</Button>
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, Result, FormField, WaterMark, FindOwer } from '@/components';
import { Card, Button, Input, Steps, Step, Select, Option, Form, Radio, RadioGroup, Switch } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicCarCreate',
    data() {
        return {
            step: 0,
            owerInfo: {},
            form: {
                building_id: null,
                is_new_energy: 0,
                car_type: 1,
                car_number: ''
            },
            rules: {
                building_id: [{ required: true, message: '请选择绑定房产' }],
                is_new_energy: [{ required: true, message: '请选择是否新能源车辆' }],
                car_type: [{ required: true, message: '请选择车辆类型' }],
                car_number: [
                    { required: true, message: '请输入车牌号码' },
                    {
                        pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/,
                        message: '请输入正确的车牌号码'
                    }
                ]
            },
            insertId: null,
            submiting: false
        };
    },
    mixins: [formMixin],
    methods: {
        preStep() {
            this.step--;
        },
        onFindOwer(data) {
            this.owerInfo = data;
            this.step++;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;
                const data = {
                    ...this.form,
                    community_id: this.postInfo.default_community_id,
                    wechat_mp_user_id: this.owerInfo.id
                };

                utils.request
                    .post('/car/create', data)
                    .then(res => {
                        this.submiting = false;
                        this.insertId = res.data.id;
                        this.step++;
                    })
                    .catch(() => (this.submiting = false));
            });
        },
        goDetail() {
            this.$router.replace(`/basic/car/detail/${this.insertId}`);
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
        Steps,
        Step,
        Select,
        Option,
        FormField,
        Form,
        Radio,
        RadioGroup,
        OSwitch: Switch,
        WaterMark
    }
};
</script>
