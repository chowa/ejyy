<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="业主信息" content="通过手机号查找业主" />
                <Step title="装修建筑" content="选择需要专修的住宅" />
                <Step title="登记成功" content="装修登记完成" />
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
                <FormField title="业主姓名">{{ owerInfo.real_name }}</FormField>
                <FormField title="装修房产" prop="building_id">
                    <Select v-model="form.building_id" placeholder="请选择需要装修的住宅">
                        <Option
                            v-for="item in [].concat(owerInfo.houses, owerInfo.merchants)"
                            :key="item.building_id"
                            :value="item.building_id"
                        >
                            {{ item | building }}
                        </Option>
                    </Select>
                </FormField>
                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="submiting" @click="submit">下一步</Button>
                </div>
            </Form>

            <Result title="装修登记成功" v-if="step === 2">
                <div slot="extra">
                    <p>及时跟进装修进度。</p>
                    <p>提醒业主周末不要装修，噪音大的装修工作集中在早8点至中午12点下午2点至5点。</p>
                    <p>物业公司不能在非合理情况下延期返还装修保证金，存在法律风险。</p>
                </div>

                <div slot="actions">
                    <Button @click="goDetail" type="primary">查看装修信息</Button>
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
import { Header, Result, WaterMark, FindOwer, FormField } from '@/components';
import { Card, Button, Input, Steps, Step, Select, Option, Form } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'BasicFitmentCreate',
    data() {
        return {
            step: 0,
            owerInfo: {},
            form: {
                building_id: null
            },
            rules: {
                building_id: [{ required: true, message: '请选择装修房产' }]
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

                utils
                    .request({
                        url: '/fitment/create',
                        data: {
                            community_id: this.postInfo.default_community_id,
                            building_id: this.form.building_id,
                            wechat_mp_user_id: this.owerInfo.id
                        },
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
            this.$router.push(`/basic/fitment/detail/${this.insertId}`);
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
        Form,
        FormField,
        WaterMark
    }
};
</script>
