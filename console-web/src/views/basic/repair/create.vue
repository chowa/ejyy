<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="报修来源" content="来自业主或公司派遣" />
                <Step title="报修信息" content="录入报修详细信息" />
                <Step title="创建成功" content="工单创建成功" />
            </Steps>

            <div v-if="step === 0" class="ivu-form">
                <RadioGroup v-model="refer">
                    <Radio label="owner">业主报修</Radio>
                    <Radio label="colleague">公司派遣</Radio>
                </RadioGroup>
                <FindOwer v-if="refer === 'owner'" class="mt-16" @on-find-owner="onFindOwer" />
                <div class="cw-form-actions" v-else>
                    <Button type="primary" :loading="getting" @click="nextStep">下一步</Button>
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
                <FormField title="业主姓名：" v-if="refer === 'owner'">
                    {{ ownerInfo.real_name }}
                </FormField>
                <FormField title="维修位置：" prop="building_id">
                    <Select v-model="form.building_id" placeholder="请选择维修位置" filterable>
                        <template v-if="refer === 'owner'">
                            <Option
                                v-for="item in [].concat(
                                    ownerInfo.houses,
                                    ownerInfo.merchants,
                                    ownerInfo.carports,
                                    ownerInfo.garages,
                                    ownerInfo.warehouses
                                )"
                                :key="item.building_id"
                                :value="item.building_id"
                            >
                                {{ building(item) }}
                            </Option>
                        </template>
                        <template v-else>
                            <Option v-for="item in buildings" :key="item.building_id" :value="item.building_id">
                                {{ building(item) }}
                            </Option>
                        </template>
                        <Option :value="0">公共区域</Option>
                    </Select>
                </FormField>
                <FormField title="维修类型：" prop="repair_type">
                    <Select v-model="form.repair_type" placeholder="请选择维修类型">
                        <Option :value="1">水暖</Option>
                        <Option :value="2">电路</Option>
                        <Option :value="3">门窗</Option>
                        <Option :value="4">公共设施</Option>
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
                <FormField title="现场图片：" prop="repair_imgs">
                    <MultipleImageUpload v-model="form.repair_imgs" dir="repair" />
                </FormField>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>

            <Result title="工单创建成功" v-if="step === 2">
                <div slot="extra">
                    <p>请及时指派人员维修。</p>
                    <p v-if="refer === 'owner'">请注意保护业主隐私。</p>
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
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
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
            refer: 'owner',
            ownerInfo: {},
            buildingList: [],
            form: {
                building_id: '',
                repair_type: '',
                description: '',
                repair_imgs: []
            },
            rules: {
                building_id: [{ required: true, message: '请选择维修位置' }],
                repair_type: [{ required: true, message: '请选择维修类型' }],
                description: [
                    { required: true, message: '请输入问题描述' },
                    { max: 200, message: '问题描述最多输入200个字' },
                    { min: 5, message: '问题描述最少输入5个字' }
                ]
            },
            buildings: [],
            insertId: null,
            fetching: false,
            getting: false,
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
            this.ownerInfo = data;
            this.step++;
        },
        nextStep() {
            this.getting = true;
            utils
                .request({
                    url: '/option/building',
                    data: {
                        community_id: this.postInfo.default_community_id
                    },
                    method: 'post'
                })
                .then(res => {
                    this.buildings = res.data.list;
                    this.step++;
                    this.getting = false;
                })
                .catch(() => (this.getting = false));
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const data = {
                    ...this.form,
                    community_id: this.postInfo.default_community_id
                };

                if (this.refer === 'owner') {
                    data['wechat_mp_user_id'] = this.ownerInfo.id;
                }

                this.submiting = true;

                utils
                    .request({
                        url: '/repair/create',
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
            this.$router.push(`/basic/repair/detail/${this.insertId}`);
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
