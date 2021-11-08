<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false">
            <Form
                :model="form"
                :rules="rules"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                class="form"
                @submit.native.prevent
            >
                <FormField prop="community_id" title="所属小区：">
                    {{ community_name }}
                </FormField>
                <FormField prop="user_id" title="巡检人员：">
                    <Colleague v-model="form.user_id" />
                </FormField>
                <FormField prop="category_id" title="任务分类：">
                    <Select v-model="form.category_id" placeholder="请选择巡检路线分类" filterable>
                        <Option v-for="item in options.category" :key="item.id" :value="item.id">
                            {{ item.name }}
                            <template v-if="item.description">-{{ item.description }}</template>
                        </Option>
                    </Select>
                </FormField>
                <FormField prop="line_id" title="巡检路线：">
                    <Select v-model="form.line_id" placeholder="请选择巡检路线" filterable>
                        <template v-for="item in options.line">
                            <Option :key="item.id" :value="item.id" v-if="form.category_id === item.category_id">
                                {{ item.name }}
                                <template v-if="item.description">-{{ item.description }}</template>
                            </Option>
                        </template>
                    </Select>
                </FormField>
                <FormField prop="start_date" title="任务开始日期：" width="260">
                    <DatePicker
                        format="yyyy年MM月dd"
                        style="width:100%"
                        v-model="form.start_date"
                        :options="{ disabledDate: d => +d < Date.now() - 1000 * 24 * 60 * 60 }"
                        placeholder="请选任务开始日期"
                    />
                </FormField>
                <FormField prop="end_date" title="任务结束日期：" width="260">
                    <DatePicker
                        format="yyyy年MM月dd"
                        style="width:100%"
                        :options="{ disabledDate: d => +d < (form.start_date ? +form.start_date : Date.now()) }"
                        v-model="form.end_date"
                        placeholder="请选任务结束日期"
                    />
                </FormField>
                <FormField prop="start_hour" title="每日上报开始时间：" width="200" unit="时">
                    <Input type="number" v-model="form.start_hour" placeholder="请输入小时数" />
                </FormField>
                <FormField prop="end_hour" title="每日上报结束时间：" width="200" unit="时">
                    <Input type="number" v-model="form.end_hour" placeholder="请输入小时数" />
                </FormField>
            </Form>

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="submit">
                    分配任务
                </Button>
            </div>
        </Card>

        <Spin size="large" fix v-if="fetching" />
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
import { Header, FormField, WaterMark, Colleague } from '@/components';
import { Card, Button, Input, DatePicker, Form, Spin, Select, Option, Message } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import moment from 'moment';

export default {
    name: 'MissionDispose',
    data() {
        return {
            fetching: true,
            form: {
                category_id: '',
                start_date: '',
                end_date: '',
                start_hour: '',
                end_hour: '',
                line_id: '',
                user_id: undefined
            },
            rules: {
                category_id: [{ required: true, type: 'number', message: '请选择任务类型' }],
                user_id: [{ required: true, type: 'number', message: '请选择巡检人员' }],
                line_id: [{ required: true, type: 'number', message: '请选择巡检路线' }],
                start_date: [{ required: true, type: 'date', message: '请选择任务开始日期' }],
                end_date: [
                    { required: true, type: 'date', message: '请选择任务结束日期' },
                    {
                        validator: (rule, val, cb) => {
                            if (val && this.form.start_date && +val > +this.form.start_date) {
                                cb();
                            } else {
                                cb(new Error('任务结束日期应大于开始日期'));
                            }
                        },
                        message: '任务结束日期应大于开始日期'
                    }
                ],
                start_hour: [
                    { required: true, message: '请输入每日上报开始时间' },
                    {
                        validator: (rule, val, cb) => {
                            if (val && val >= 0 && val <= 23) {
                                cb();
                            } else {
                                cb(new Error('每日上报开始时间错误'));
                            }
                        },
                        message: '每日上报开始时间错误，请输入0-23之间的整数'
                    }
                ],
                end_hour: [
                    { required: true, message: '请输入每日上报结束时间' },
                    {
                        validator: (rule, val, cb) => {
                            if (val && val >= 0 && val <= 23) {
                                cb();
                            } else {
                                cb(new Error('每日上报结束时间错误'));
                            }
                        },
                        message: '每日上报结束时间错误，请输入0-23之间的整数'
                    },
                    {
                        validator: (rule, val, cb) => {
                            if (val && this.form.start_hour && parseInt(this.form.start_hour, 10) < parseInt(val, 10)) {
                                cb();
                            } else {
                                cb(new Error('开始时间应小于结束时间'));
                            }
                        },
                        message: '开始时间应小于结束时间'
                    }
                ]
            },
            submiting: false,
            options: {
                category: [],
                line: []
            }
        };
    },
    mixins: [formMixin],
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getOptions();
        }
    },
    methods: {
        getOptions() {
            utils.request
                .post('/mission_manage/option', { community_id: this.postInfo.default_community_id })
                .then(res => {
                    this.options = res.data;
                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const data = {
                    community_id: this.postInfo.default_community_id,
                    ...this.form
                };

                data.start_date = moment(data.start_date)
                    .startOf('day')
                    .valueOf();
                data.end_date = moment(data.end_date)
                    .endOf('day')
                    .valueOf();

                data.start_hour = parseInt(data.start_hour, 10);
                data.end_hour = parseInt(data.end_hour, 10);

                this.submiting = true;

                utils
                    .request({
                        url: '/mission/create',
                        data,
                        method: 'post'
                    })
                    .then(res => {
                        this.submiting = false;
                        this.$router.push(`/oa/mission/detail/${res.data.id}`);
                        Message.success('任务分配成功');
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
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
    watch: {
        'postInfo.default_community_id'() {
            this.getOptions();
        }
    },
    components: {
        Header,
        Card,
        Button,
        Input,
        FormField,
        Form,
        DatePicker,
        WaterMark,
        Spin,
        Select,
        Option,
        Colleague
    }
};
</script>
