<template>
    <WaterMark>
        <Header back />

        <Result
            v-if="finish"
            :type="error ? 'error' : 'success'"
            :title="finish && !error ? '任务已完成' : '初始化任务失败'"
            :description="error ? errMsg : '今日巡检任务已完成'"
        >
            <div slot="actions">
                <Button @click="goList" :type="error ? 'default' : 'primary'">
                    {{ error ? '返回任务列表' : '查看未完成任务' }}
                </Button>
            </div>
        </Result>
        <Card dis-hover :bordered="false" v-else>
            <Steps :current="step">
                <Step v-for="item in lineInfo" :title="item.local" :key="item.id" />
            </Steps>
            <Form
                :model="form"
                :rules="rules"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                class="form"
                @submit.native.prevent
            >
                <FormField prop="point_id" title="巡检点：">
                    {{ lineInfo[step] ? lineInfo[step].local : '' }}
                </FormField>
                <FormField prop="normal" title="是否正常：">
                    <OSwitch v-model="form.normal" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>
                <FormField prop="remark" title="巡检备注：">
                    <Input
                        type="textarea"
                        :rows="3"
                        v-model="form.remark"
                        show-word-limit
                        :maxlength="256"
                        placeholder="请输入巡检备注，非必须，如果巡检点有异常情况请填写"
                    />
                </FormField>
                <FormField prop="imgs" title="现场图片：">
                    <MultipleImageUpload v-model="form.imgs" :max="3" dir="mission" />
                </FormField>
            </Form>

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="submit">
                    提交巡检结果
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
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Button, Form, Input, Switch, Steps, Step, Message } from 'view-design';
import { Header, WaterMark, MultipleImageUpload, Result, FormField } from '@/components';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';

export default {
    name: 'OaMissionSubmit',
    data() {
        return {
            fetching: true,
            error: false,
            errMsg: '',
            finish: false,
            complete_id: undefined,
            lineInfo: [],
            step: 0,
            form: {
                normal: 1,
                remark: '',
                imgs: []
            },
            rules: {
                normal: [{ required: true, message: '请选择是否存正常', type: 'number' }],
                remark: [{ max: 256, message: '巡检备注不能超过256个字符' }],
                imgs: [{ required: true, type: 'array', min: 1, message: '请上传现场图片' }]
            },
            submiting: false
        };
    },
    mixins: [formMixin],
    mounted() {
        if (this.postInfo.default_community_id) {
            this.intInfo();
        }
    },
    methods: {
        intInfo() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/mission/init', data)
                .then(res => {
                    this.fetching = false;
                    this.complete_id = res.data.complete_id;
                    this.lineInfo = res.data.lineInfo;

                    if (res.data.point_id) {
                        this.step = this.lineInfo.findIndex(item => item.id === res.data.point_id) + 1;
                    } else {
                        this.step = 0;
                    }
                })
                .catch(res => {
                    this.fetching = false;
                    this.finish = true;
                    this.error = true;
                    this.errMsg = res.message;
                });
        },
        goList() {
            this.$router.push('/oa/mission');
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                const data = {
                    id: this.$route.params.id,
                    point_id: this.lineInfo[this.step].id,
                    community_id: this.postInfo.default_community_id,
                    complete_id: this.complete_id,
                    normal: this.form.normal,
                    remark: this.form.remark,
                    img1: this.form.imgs[0],
                    img2: this.form.imgs[1] ? this.form.imgs[1] : undefined,
                    img3: this.form.imgs[2] ? this.form.imgs[2] : undefined
                };

                utils.request
                    .post('/mission/submit', data)
                    .then(res => {
                        if (res.data.finish) {
                            this.finish = true;
                        } else {
                            this.step++;
                            this.form = {
                                normal: 1,
                                remark: '',
                                imgs: []
                            };
                            this.$refs.form.resetFields();
                            Message.success('提交成功');
                        }
                        this.submiting = false;
                    })
                    .catch(() => (this.submiting = false));
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.intInfo();
        }
    },
    components: {
        Card,
        Spin,
        Header,
        WaterMark,
        MultipleImageUpload,
        Result,
        Button,
        Input,
        Form,
        FormField,
        OSwitch: Switch,
        Steps,
        Step
    }
};
</script>

<style lang="less"></style>
