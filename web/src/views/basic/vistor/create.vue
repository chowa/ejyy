<template>
    <WaterMark>
        <Header />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="业主信息" content="根据手机号确认访问业主" />
                <Step title="访客信息" content="录入访客信息" />
                <Step title="登记成功" content="访客信息登记成功" />
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
                <FormField title="到访位置：" prop="building_id">
                    <Select v-model="form.building_id" placeholder="请选择到访位置" filterable>
                        <Option
                            v-for="item in [].concat(
                                owerInfo.houses,
                                owerInfo.merchants,
                                owerInfo.carports,
                                owerInfo.garages,
                                owerInfo.warehouses
                            )"
                            :key="item.building_id"
                            :value="item.building_id"
                        >
                            {{ building(item) }}
                        </Option>
                    </Select>
                </FormField>
                <FormField title="访客姓名：" prop="vistor_name">
                    <Input v-model="form.vistor_name" placeholder="请输入访客姓名" />
                </FormField>
                <FormField title="访客电话：" prop="vistor_phone">
                    <Input v-model="form.vistor_phone" placeholder="请输入访客电话" />
                </FormField>
                <FormField title="访客车牌：" prop="car_number">
                    <Input v-model="form.car_number" placeholder="请输入访客车牌" />
                </FormField>
                <FormField title="到访时间：" prop="expire">
                    <DatePicker
                        type="datetime"
                        v-model="form.expire"
                        :options="{ disabledDate: d => +d < Date.now() - 60 * 60 * 24 * 1000 }"
                        placeholder="请选择到访时间，到访时间结束前可使用一次"
                    />
                </FormField>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>

            <Result title="访客信息登记成功" v-if="step === 2">
                <div slot="extra">
                    <p>请将访客二维码发放给访客：</p>
                    <canvas ref="canvas" class="mg-auto" />
                </div>

                <div slot="actions">
                    <Button @click="goScan" type="error">访客认证</Button>
                    <Button @click="goDetail" type="primary">查看访客详细</Button>
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
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, Result, FormField, FindOwer, WaterMark } from '@/components';
import { Card, Button, Input, Steps, Step, Select, Option, Form, DatePicker } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import qrcode from 'qrcode';

export default {
    name: 'BasicVistorCreate',
    data() {
        return {
            step: 0,
            phone: '',
            owerInfo: {},
            form: {
                building_id: '',
                vistor_name: '',
                vistor_phone: '',
                car_number: '',
                expire: ''
            },
            rules: {
                building_id: [{ required: true, message: '请选择到访位置' }],
                vistor_name: [
                    { required: true, message: '请输入访客姓名' },
                    { max: 8, message: '访客姓名不能超过8个字' }
                ],
                vistor_phone: [{ required: true, pattern: /^1\d{10}$/, message: '请输入正确的访客手机号码' }],
                car_number: [
                    {
                        pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/,
                        message: '请输入正确的车牌号码'
                    }
                ],
                expire: [{ required: true, message: '请选择访客到访时间' }]
            },
            insertId: null,
            getting: false,
            fetching: false,
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
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const data = {
                    ...this.form,
                    user_id: this.owerInfo.id,
                    community_id: this.postInfo.default_community_id
                };

                data.expire = +data.expire;
                this.submiting = true;

                utils
                    .request({
                        url: '/vistor/create',
                        data,
                        method: 'post'
                    })
                    .then(res => {
                        this.submiting = false;
                        this.insertId = res.data.id;
                        this.step++;

                        this.$nextTick(() => {
                            qrcode.toCanvas(this.$refs.canvas, res.data.uid, {
                                width: 220,
                                height: 220,
                                margin: 2
                            });
                        });
                    })
                    .catch(() => (this.submiting = false));
            });
        },
        goDetail() {
            this.$router.push(`/basic/vistor/detail/${this.insertId}`);
        },
        goScan() {
            this.$router.push('/basic/vistor/scan');
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    components: {
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
        DatePicker,
        FindOwer,
        WaterMark
    }
};
</script>
