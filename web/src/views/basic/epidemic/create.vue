<template>
    <WaterMark>
        <Header />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="业主信息" content="根据手机号确认业主信息" />
                <Step title="健康信息" content="登记体温、健康码状态" />
                <Step title="登记成功" content="疫情防控信息登记成功" />
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
                <FormField title="小区名称：">
                    {{ community_name }}
                </FormField>
                <FormField title="出入住所：" prop="building_id">
                    <Select v-model="form.building_id" placeholder="请选择出入住所" filterable>
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
                <FormField title="健康码状态：" prop="tour_code">
                    <RadioGroup v-model="form.tour_code">
                        <Radio :label="1"><Tag color="success">绿码</Tag></Radio>
                        <Radio :label="2"><Tag color="warning">黄码</Tag></Radio>
                        <Radio :label="3"><Tag color="error">红码</Tag></Radio>
                    </RadioGroup>
                </FormField>
                <FormField title="体温" prop="temperature" width="180" unit="℃">
                    <Input v-model="form.temperature" type="number" placeholder="请输入体温" />
                </FormField>
                <FormField title="外地返回：" prop="return_hometown">
                    <RadioGroup v-model="form.return_hometown">
                        <Radio :label="1"><Tag color="default">是</Tag></Radio>
                        <Radio :label="0"><Tag color="orange">否</Tag></Radio>
                    </RadioGroup>
                </FormField>
                <FormField title="返回地：" prop="address" v-if="form.return_hometown">
                    <AreaSelect v-model="form.address" />
                </FormField>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>

            <Result title="疫情防控信息登记成功" v-if="step === 2">
                <div slot="extra">
                    <p>行程码非绿码的情况，应立即通知社区和疫情防控指挥部！</p>
                </div>
                <div slot="actions">
                    <Button @click="reset" type="default">重新登记</Button>
                    <Button @click="goDetail" type="primary">查看防控信息</Button>
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
import { Header, Result, FormField, AreaSelect, WaterMark, FindOwer } from '@/components';
import { Card, Button, Input, Steps, Step, Select, Option, Form, Radio, RadioGroup, Tag } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicEpidemicCreate',
    data() {
        return {
            step: 0,
            owerInfo: {},
            form: {
                community_id: '',
                building_id: '',
                tour_code: 1,
                temperature: '',
                return_hometown: 0,
                address: []
            },
            rules: {
                building_id: [{ required: true, type: 'number', message: '请选择出入住所' }],
                tour_code: [{ required: true, type: 'number', message: '请选择健康码颜色' }],
                temperature: [{ required: true, message: '请输入当前体温' }],
                return_hometown: [{ required: true, type: 'number', message: '请选择是否外地返回' }],
                address: [{ required: true, type: 'array', len: 3, message: '请选择外地信息' }]
            },
            insertId: null,
            fetching: false,
            submiting: false
        };
    },
    mixins: [formMixin],
    methods: {
        building(record) {
            return utils.building.text(record, false);
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
                    wechat_mp_user_id: this.owerInfo.id,
                    community_id: this.postInfo.default_community_id,
                    return_from_province: this.form.address[0],
                    return_from_city: this.form.address[1],
                    return_from_district: this.form.address[2]
                };

                delete data.address;
                this.submiting = true;

                utils
                    .request({
                        url: '/epidemic/create',
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
            this.$router.push(`/basic/epidemic/detail/${this.insertId}`);
        },
        reset() {
            this.step = 0;
            this.phone = '';
            this.form = {
                community_id: '',
                building_id: '',
                tour_code: 1,
                temperature: '',
                return_hometown: 0,
                address: []
            };
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        }
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
        AreaSelect,
        Radio,
        RadioGroup,
        Tag,
        WaterMark
    }
};
</script>
