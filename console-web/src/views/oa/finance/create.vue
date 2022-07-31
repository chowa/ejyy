<template>
    <WaterMark>
        <Header back />

        <Result type="error" title="当前物业公司不支持微信支付物业费用" v-if="!postInfo.wechat_payment">
            <div slot="extra">
                <p>
                    如需开通，请联系卓瓦科技工作人员或发送邮件至发信至
                    <a href="mailto:contact@chowa.cn">技术支持</a>
                    。
                </p>
            </div>
        </Result>

        <Card dis-hover :bordered="false" v-else>
            <Alert show-icon type="info">
                物业费用计算时，小于一分的将被忽略计算，请知晓。
            </Alert>
            <Form
                :model="form"
                :rules="rules"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                class="form"
                @submit.native.prevent
            >
                <FormField prop="community_id" title="收费小区：">
                    {{ community_name }}
                </FormField>
                <FormField prop="start_year" title="物业费起始年份：">
                    <DatePicker
                        type="year"
                        v-model="form.start_year"
                        :options="{ disabledDate: this.startYearDisabledDate }"
                        placeholder="请选择物业费起始年份"
                    />
                </FormField>
                <FormField prop="end_year" title="物业费结束年份：">
                    <DatePicker
                        type="year"
                        v-model="form.end_year"
                        :options="{ disabledDate: this.endYearDisabledDate }"
                        placeholder="请选择物业费结束年份"
                    />
                </FormField>
                <FormField prop="computed_house_fee_by_area" title="住宅物业费计算方式：">
                    <RadioGroup v-model="form.computed_house_fee_by_area">
                        <Radio :label="0">单位建筑</Radio>
                        <Radio :label="1">建筑面积</Radio>
                    </RadioGroup>
                </FormField>
                <FormField prop="house_fee" title="住宅物业费：" unit="分" width="240" :label="house_fee_msg">
                    <Input v-model="form.house_fee" placeholder="请输入住宅物业费" type="number" />
                </FormField>
                <FormField prop="computed_carport_fee_by_area" title="车位物业费计算方式：">
                    <RadioGroup v-model="form.computed_carport_fee_by_area">
                        <Radio :label="0">单位建筑</Radio>
                        <Radio :label="1">建筑面积</Radio>
                    </RadioGroup>
                </FormField>
                <FormField prop="carport_fee" title="车位物业费：" unit="分" width="240" :label="carport_fee_msg">
                    <Input v-model="form.carport_fee" placeholder="请输入车位物业费" type="number" />
                </FormField>
                <FormField prop="computed_warehouse_fee_by_area" title="仓房物业费计算方式：">
                    <RadioGroup v-model="form.computed_warehouse_fee_by_area">
                        <Radio :label="0">单位建筑</Radio>
                        <Radio :label="1">建筑面积</Radio>
                    </RadioGroup>
                </FormField>
                <FormField prop="warehoure_fee" title="仓房物业费：" unit="分" width="240" :label="warehoure_fee_msg">
                    <Input v-model="form.warehoure_fee" placeholder="请输入仓房物业费" type="number" />
                </FormField>
                <FormField prop="computed_merchant_fee_by_area" title="商户物业费计算方式：">
                    <RadioGroup v-model="form.computed_merchant_fee_by_area">
                        <Radio :label="0">单位建筑</Radio>
                        <Radio :label="1">建筑面积</Radio>
                    </RadioGroup>
                </FormField>
                <FormField prop="merchant_fee" title="商户物业费：" unit="分" width="240" :label="merchant_fee_msg">
                    <Input v-model="form.merchant_fee" placeholder="请输入商户物业费" type="number" />
                </FormField>
                <FormField prop="computed_garage_fee_by_area" title="车库物业费计算方式：">
                    <RadioGroup v-model="form.computed_garage_fee_by_area">
                        <Radio :label="0">单位建筑</Radio>
                        <Radio :label="1">建筑面积</Radio>
                    </RadioGroup>
                </FormField>
                <FormField prop="garage_fee" title="车库物业费：" unit="分" width="240" :label="garage_fee_msg">
                    <Input v-model="form.garage_fee" placeholder="请输入车库物业费" type="number" />
                </FormField>
                <FormField prop="wechat_push" title="微信公众号推送收费通知：">
                    <OSwitch v-model="form.wechat_push" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>
                <FormField prop="sms_push" title="短信推送收费通知：">
                    <OSwitch v-model="form.sms_push" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>

                <div class="cw-form-actions">
                    <Button type="primary" :loading="submiting" @click="submit">
                        发起收费
                    </Button>
                </div>
            </Form>
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
import { Header, FormField, Result, WaterMark } from '@/components';
import { Card, Button, Input, Radio, RadioGroup, DatePicker, Message, Form, Alert, Switch } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import moment from 'moment';

export default {
    name: 'OaFinanceCreate',
    data() {
        return {
            labelWidth: 240,
            form: {
                start_year: '',
                end_year: '',
                house_fee: '',
                computed_house_fee_by_area: 1,
                carport_fee: '',
                computed_carport_fee_by_area: 0,
                warehoure_fee: '',
                computed_warehouse_fee_by_area: 0,
                merchant_fee: '',
                computed_merchant_fee_by_area: 1,
                garage_fee: '',
                computed_garage_fee_by_area: 0,
                wechat_push: 0,
                sms_push: 0
            },
            rules: {
                start_year: [{ required: true, type: 'date', message: '请选择物业费起始年份' }],
                end_year: [
                    { required: true, type: 'date', message: '请选择物业费结束年份' },
                    {
                        validator: (rule, val, cb) => {
                            const pass = this.form.start_year ? +this.form.start_year < +val : true;

                            if (pass) {
                                cb();
                            } else {
                                cb(new Error('结束年份应大于开始年份'));
                            }
                        },
                        message: '结束年份应大于开始年份'
                    }
                ],
                house_fee: [
                    { required: true, message: '请输入住宅物业费' },
                    { max: 9, message: '住宅物业费不能高于1000000元' },
                    { pattern: /^\d+$/, message: '请输入正确的金额，不能包含小数' }
                ],
                computed_house_fee_by_area: [{ required: true, type: 'number', message: '请选择住宅物业费计算方式' }],
                carport_fee: [
                    { required: true, message: '请输入车位物业费' },
                    { max: 9, message: '车位物业费不能高于1000000元' },
                    { pattern: /^\d+$/, message: '请输入正确的金额，不能包含小数' }
                ],
                computed_carport_fee_by_area: [{ required: true, type: 'number', message: '请选择车位物业费计算方式' }],
                warehoure_fee: [
                    { required: true, message: '请输入仓房物业费' },
                    { max: 9, message: '仓房物业费不能高于1000000元' },
                    { pattern: /^\d+$/, message: '请输入正确的金额，不能包含小数' }
                ],
                computed_warehouse_fee_by_area: [
                    { required: true, type: 'number', message: '请选择仓房物业费计算方式' }
                ],
                merchant_fee: [
                    { required: true, message: '请输入商户物业费' },
                    { max: 9, message: '商户物业费不能高于1000000元' },
                    { pattern: /^\d+$/, message: '请输入正确的金额，不能包含小数' }
                ],
                computed_merchant_fee_by_area: [
                    { required: true, type: 'number', message: '请选择商户物业费计算方式' }
                ],
                garage_fee: [
                    { required: true, message: '请输入车库物业费' },
                    { max: 9, message: '车库物业费不能高于1000000元' },
                    { pattern: /^\d+$/, message: '请输入正确的金额，不能包含小数' }
                ],
                computed_garage_fee_by_area: [{ required: true, type: 'number', message: '请选择车库物业费计算方式' }],
                wechat_push: [{ required: true, type: 'number', message: '请选择是否通过微信公众号推送收费通知' }],
                sms_push: [{ required: true, type: 'number', message: '请选择是否通过短信推送收费通知' }]
            },
            submiting: false
        };
    },
    mixins: [formMixin],
    methods: {
        startYearDisabledDate(d) {
            return (
                +d <
                moment()
                    .subtract(1, 'year')
                    .valueOf()
            );
        },
        endYearDisabledDate(d) {
            return +d < moment().valueOf();
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                const data = {
                    ...this.form,
                    community_id: this.postInfo.default_community_id
                };

                data.start_year = moment(data.start_year).format('YYYY');
                data.end_year = moment(data.end_year).format('YYYY');

                utils
                    .request({
                        url: '/payment/create',
                        data,
                        method: 'post'
                    })
                    .then(res => {
                        this.submiting = false;
                        this.$router.push(`/oa/finance/unpay/${res.data.id}`);
                        Message.success('创建物业收费成功');
                    })
                    .catch(() => (this.submiting = false));
            });
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
        },
        house_fee_msg() {
            if (!this.form.house_fee) {
                return '';
            }

            return `住宅按照${this.form.computed_house_fee_by_area ? '每平方米' : '单位建筑'}收取${utils.payment.yuan(
                this.form.house_fee
            )}元`;
        },
        carport_fee_msg() {
            if (!this.form.carport_fee) {
                return '';
            }

            return `车位按照${this.form.computed_carport_fee_by_area ? '每平方米' : '单位建筑'}收取${utils.payment.yuan(
                this.form.carport_fee
            )}元`;
        },
        warehoure_fee_msg() {
            if (!this.form.warehoure_fee) {
                return '';
            }

            return `仓房按照${
                this.form.computed_warehouse_fee_by_area ? '每平方米' : '单位建筑'
            }收取${utils.payment.yuan(this.form.warehoure_fee)}元`;
        },
        merchant_fee_msg() {
            if (!this.form.merchant_fee) {
                return '';
            }

            return `商户按照${
                this.form.computed_merchant_fee_by_area ? '每平方米' : '单位建筑'
            }收取${utils.payment.yuan(this.form.merchant_fee)}元`;
        },
        garage_fee_msg() {
            if (!this.form.garage_fee) {
                return '';
            }

            return `车库按照${this.form.computed_garage_fee_by_area ? '每平方米' : '单位建筑'}收取${utils.payment.yuan(
                this.form.garage_fee
            )}元`;
        }
    },
    components: {
        Header,
        Card,
        Button,
        Input,
        Radio,
        RadioGroup,
        FormField,
        Form,
        DatePicker,
        Result,
        Alert,
        WaterMark,
        OSwitch: Switch
    }
};
</script>
