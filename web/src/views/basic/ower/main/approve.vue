<template>
    <WaterMark class="ower-approve">
        <Header back />

        <Card dis-hover :bordered="false">
            <Steps :current="step">
                <Step title="业主注册" content="引导业主注册「e家宜业」小程序" />
                <Step title="房产" content="核实并录入房产信息" />
                <Step title="扫码绑定" content="业主扫描认证二维码完成绑定" />
            </Steps>

            <div v-if="step === 0" class="help">
                <RadioGroup v-model="is_old_user">
                    <Radio :label="0">新用户注册引导</Radio>
                    <Radio :label="1">已注册用户认证引导</Radio>
                </RadioGroup>
                <Row v-if="!is_old_user">
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/qrcode.jpg" />
                        <p>a).引导业主使用微信扫描「二维码」</p>
                    </Col>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/login.jpg" />
                        <p>b).请业主点击「登录」授权</p>
                    </Col>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/fill.jpg" />
                        <p>c).请业主如实完成身份信息认证</p>
                    </Col>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/approve.jpg" />
                        <p>d).请业主点击「物业公司认证住宅」扫描稍后生成的二维码</p>
                    </Col>
                </Row>
                <Row v-else>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/qrcode.jpg" />
                        <p>a).引导业主使用微信扫描「二维码」</p>
                    </Col>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/home.jpg" />
                        <p>b).请业主点击首页中「小区设置」按钮</p>
                    </Col>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/list.jpg" />
                        <p>c).请业主点击下方「添加住宅」按钮</p>
                    </Col>
                    <Col :lg="6" :sm="12" :xs="24">
                        <img src="~@/assets/help/ump/approve.jpg" />
                        <p>d).请业主点击「物业公司认证住宅」扫描稍后生成的二维码</p>
                    </Col>
                </Row>
                <div class="cw-form-actions">
                    <Button type="primary" :loading="getting" @click="getBuilding">下一步</Button>
                </div>
            </div>

            <div v-if="step === 1" class="ivu-form">
                <Form
                    :model="form"
                    ref="form"
                    :label-position="mlabelPostion"
                    :label-width="mlabelWidth"
                    @submit.native.prevent
                    :rules="rules"
                >
                    <FormField title="小区名称：">{{ community_name }}</FormField>
                    <FormField title="业主房产：" prop="building_ids">
                        <Select v-model="form.building_ids" multiple placeholder="请选择业主房产" filterable>
                            <Option v-for="item in buildingList" :key="item.building_id" :value="item.building_id">
                                {{ item | building }}
                            </Option>
                        </Select>
                    </FormField>
                </Form>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                    <Button type="primary" :loading="fetching" @click="getQrcode">下一步</Button>
                </div>
            </div>

            <div v-if="step === 2" class="qrocde-qrapper">
                <div class="qrcode">
                    <canvas ref="canvas" class="mg-auto" />
                    <div class="mask" v-if="expired">二维码已过期</div>
                </div>
                <p>{{ expireText }}</p>
                <p v-if="!expired">二维码有效期内，一码可供多位业主使用</p>

                <div class="cw-form-actions">
                    <Button @click="preStep">上一步</Button>
                </div>
            </div>
        </Card>
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, FormField, WaterMark } from '@/components';
import { Card, Button, Steps, Step, Alert, Select, Option, Form, Row, Col, Radio, RadioGroup } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import qrcode from 'qrcode';
import moment from 'moment';

export default {
    name: 'BasicOwerApprove',
    data() {
        return {
            step: 0,
            is_old_user: 0,
            buildingList: [],
            form: {
                building_ids: []
            },
            rules: {
                building_ids: [{ required: true, type: 'array', message: '请选择业主所有房产' }]
            },
            getting: false,
            fetching: false,
            expired: false,
            expireText: ''
        };
    },
    mixins: [formMixin],
    destroyed() {
        clearInterval(this.timer);
    },
    methods: {
        preStep() {
            clearInterval(this.timer);
            this.step--;
        },
        getBuilding() {
            if (this.buildingList.length > 0) {
                return this.step++;
            }

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
                    this.buildingList = res.data.list;
                    this.step++;
                    this.getting = false;
                })
                .catch(() => (this.getting = false));
        },
        getQrcode() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.fetching = true;

                utils
                    .request({
                        url: '/ower/approve',
                        data: {
                            community_id: this.postInfo.default_community_id,
                            ...this.form
                        },
                        method: 'post'
                    })
                    .then(res => {
                        this.expired = false;
                        this.expireText = '';
                        this.step++;
                        this.fetching = false;

                        this.$nextTick(() => {
                            qrcode.toCanvas(this.$refs.canvas, res.data.text, {
                                width: 220,
                                height: 220,
                                margin: 2
                            });

                            this.startCountdown(res.data.stamp, res.data.expire);
                        });
                    })
                    .catch(() => (this.fetching = false));
            });
        },
        startCountdown(stamp, expire) {
            this.timer = setInterval(() => {
                if (expire <= Date.now() - stamp) {
                    this.expireText = '';
                    this.expired = true;
                    clearInterval(this.timer);
                } else {
                    this.expireText = `${moment(expire - (Date.now() - stamp)).format('mm:ss')}后过期`;
                }
            }, 1000);
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
        Alert,
        Header,
        Card,
        Button,
        Steps,
        Step,
        Select,
        Option,
        FormField,
        Form,
        Row,
        Col,
        Radio,
        WaterMark,
        RadioGroup
    }
};
</script>

<style lang="less">
.ower-approve {
    .help {
        padding: 40px 20px;

        .ivu-row {
            padding: 40px 0;
        }

        img {
            max-width: 200px;
            margin: auto;
        }

        p {
            margin-top: 26px;
            text-align: center;
        }
    }

    .qrocde-qrapper {
        padding-top: 40px;

        .qrcode {
            width: 220px;
            height: 220px;
            margin: auto;
            position: relative;
            margin-bottom: 20px;

            .mask {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 100;
                line-height: 220px;
                text-align: center;
                color: #fff;
                background: rgba(0, 0, 0, 0.85);
            }
        }

        p {
            text-align: center;
        }
    }
}
</style>
