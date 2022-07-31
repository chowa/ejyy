<template>
    <WaterMark class="contract-editor">
        <Card dis-hover :bordered="false" title="合同信息">
            <Form
                :model="form"
                ref="form"
                :label-position="mlabelPostion"
                :label-width="mlabelWidth"
                @submit.native.prevent
                :rules="rules"
            >
                <FormField title="所在小区：">{{ community_name }}小区</FormField>
                <FormField title="合同名称：" prop="title" width="300">
                    <Input v-model="form.title" placeholder="请输入合同名称" />
                </FormField>
                <FormField title="甲方：" prop="first_party" width="300">
                    <Input v-model="form.first_party" placeholder="请输入甲方称呼" />
                </FormField>
                <FormField title="甲方联系人：" prop="first_party_linkman" width="180">
                    <Input v-model="form.first_party_linkman" placeholder="请输入甲方联系人" />
                </FormField>
                <FormField title="甲方联系电话：" prop="first_party_phone" width="220">
                    <Input v-model="form.first_party_phone" placeholder="请输入甲方联系电话" />
                </FormField>
                <FormField title="乙方系业主：" prop="is_owner">
                    <OSwitch v-model="form.is_owner">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormField>
                <FormField title="乙方：" prop="second_party" width="300" v-if="!form.is_owner">
                    <Input v-model="form.second_party" placeholder="请输入乙方称呼" />
                </FormField>
                <FormField title="乙方联系人：" prop="second_party_linkman" width="180" v-if="!form.is_owner">
                    <Input v-model="form.second_party_linkman" placeholder="请输入乙方联系人" />
                </FormField>
                <FormField title="乙方联系电话：" prop="second_party_phone" width="220" v-if="!form.is_owner">
                    <Input v-model="form.second_party_phone" placeholder="请输入乙方联系电话" />
                </FormField>
                <FormField title="乙方业主电话：" prop="owner_phone" width="300" v-if="form.is_owner">
                    <Input
                        prefix="ios-contact"
                        class="user-input"
                        :readonly="ownerFetching"
                        v-model="form.owner_phone"
                        :suffix="ownerFetching ? 'ios-loading' : ''"
                        placeholder="请输入业主手机号码"
                    />
                </FormField>
                <FormField
                    title="乙方业主姓名："
                    prop="second_party_wechat_mp_user_id"
                    width="300"
                    v-if="form.is_owner"
                >
                    <span v-if="form.second_party_wechat_mp_user_id">{{ ownerInfo.real_name }}</span>
                    <span v-else>-</span>
                </FormField>
                <FormField title="合同类别：" prop="category_id" width="220">
                    <Select placeholder="请选择合同类别" v-model="form.category_id">
                        <Option v-for="item in options" :key="item.id" :value="item.id">
                            {{ item.name }}
                            <template v-if="item.description">-{{ item.description }}</template>
                        </Option>
                    </Select>
                </FormField>
                <FormField title="合同开始时间：" prop="begin_time">
                    <DatePicker
                        v-model="form.begin_time"
                        placeholder="请选择合同开始时间"
                        :options="{ disabledDate: d => +d < Date.now() }"
                    />
                </FormField>
                <FormField title="合同结束时间：" prop="finish_time">
                    <DatePicker
                        v-model="form.finish_time"
                        placeholder="请选择合同结束时间"
                        :options="{ disabledDate: d => +d < Date.now() }"
                    />
                </FormField>
                <FormField title="合同金额：" prop="contract_fee" width="300">
                    <Input v-model="form.contract_fee" readonly />
                </FormField>
            </Form>
        </Card>

        <Card dis-hover :bordered="false" title="合同项目" class="mt-16">
            <a slot="extra" @click="addItem">
                <Icon type="ios-add-circle-outline" />
                添加项目
            </a>
            <div v-for="(item, key) in items" :key="key" class="item">
                <ContractItemEditor
                    ref="item"
                    :detail="item"
                    v-model="items[key]"
                    :index="key + 1"
                    :isOwer="form.is_owner"
                    :options="
                        !ownerInfo.id
                            ? []
                            : [].concat(
                                  ownerInfo.houses,
                                  ownerInfo.merchants,
                                  ownerInfo.carports,
                                  ownerInfo.garages,
                                  ownerInfo.warehouses
                              )
                    "
                />
                <a @click="removeItem(key)" class="remove">
                    <Icon type="ios-trash-outline" />
                    删除项目{{ key + 1 }}
                </a>
            </div>
        </Card>

        <div class="cw-form-actions">
            <Button type="primary" :loading="submiting" @click="submit">{{ update ? '修改合同' : '创建合同' }}</Button>
        </div>
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
import { FormField, WaterMark } from '@/components';
import { Card, Button, Form, Input, DatePicker, Icon, Switch, Select, Option, Message } from 'view-design';
import formMixin from '@/mixins/form';
import * as utils from '@/utils';
import ContractItemEditor from './item';

export default {
    name: 'ContractEditor',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {};
            }
        },
        update: Boolean,
        onSubmit: Function
    },
    data() {
        const { detail } = this;

        return {
            options: [],
            ownerFetching: false,
            disabled: false,
            ownerInfo: {},
            form: {
                title: detail.title ? detail.title : '',
                category_id: detail.category_id ? detail.category_id : undefined,
                first_party: detail.first_party ? detail.first_party : '',
                first_party_linkman: detail.first_party_linkman ? detail.first_party_linkman : '',
                first_party_phone: detail.first_party_phone ? detail.first_party_phone : '',
                second_party: detail.second_party ? detail.second_party : '',
                second_party_linkman: detail.second_party_linkman ? detail.second_party_linkman : '',
                second_party_phone: detail.second_party_phone ? detail.second_party_phone : '',
                owner_phone: detail.owner_phone ? detail.owner_phone : '',
                second_party_wechat_mp_user_id: detail.second_party_wechat_mp_user_id
                    ? detail.second_party_wechat_mp_user_id
                    : undefined,
                begin_time: detail.begin_time ? detail.begin_time : undefined,
                finish_time: detail.finish_time ? detail.finish_time : undefined,
                contract_fee: detail.contract_fee ? detail.contract_fee : 0,
                is_owner: detail.is_owner ? detail.is_owner : false
            },
            items: detail.items ? detail.items : [{}],
            rules: {
                title: [
                    { required: true, message: '请输入合同名称' },
                    { max: 56, message: '合同名称不能超过56个字' }
                ],
                first_party: [
                    { required: true, message: '请输入甲方称呼' },
                    { max: 56, message: '甲方称呼不能超过56个字' }
                ],
                first_party_linkman: [
                    { required: true, message: '请输入甲方联系人' },
                    { max: 8, message: '甲方联系人不能超8个字' }
                ],
                first_party_phone: [{ required: true, pattern: /^\d{11}$/, message: '请输入正确的甲方联系电话' }],
                second_party: [
                    { required: true, message: '请输入乙方称呼' },
                    { max: 56, message: '乙方称呼不能超过56个字' }
                ],
                second_party_linkman: [
                    { required: true, message: '请输入乙方联系人' },
                    { max: 8, message: '乙方联系人不能超8个字' }
                ],
                second_party_phone: [{ required: true, pattern: /^\d{11}$/, message: '请输入正确的乙方联系电话' }],
                owner_phone: [{ required: true, pattern: /^\d{11}$/, message: '请输入正确的业主联系电话' }],
                second_party_wechat_mp_user_id: [{ required: true, type: 'number', message: '请输入乙方业主手机号码' }],
                category_id: [{ required: true, type: 'number', message: '请选择合同类别' }],
                begin_time: [{ required: true, type: 'date', message: '请选择合同开始日期' }],
                finish_time: [
                    { required: true, type: 'date', message: '请选择合同结束日期' },
                    {
                        message: '结束日期应大于开始日期',
                        validator: (rule, val, cb) => {
                            if (val && this.form.begin_time && +this.form.begin_time > +val) {
                                cb(new Error('结束时间应大于开始时间'));
                            } else {
                                cb();
                            }
                        }
                    }
                ],
                contract_fee: [{ required: true, type: 'number', message: '请录入合同条目' }],
                is_owner: [{ required: true, type: 'boolean', message: '请选择是否系业主合同' }]
            },
            submiting: false
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
            utils.request.get('/contract/option').then(res => {
                this.options = res.data.list;
            });
        },
        addItem() {
            this.items.push({});
        },
        removeItem(index) {
            if (this.items.length === 1) {
                return Message.warning('至少要有一个合同项目');
            }

            this.items.splice(index, 1);
        },
        submit() {
            this.$refs.form.validate(valid => {
                Promise.all(
                    this.items.map((item, key) => {
                        return new Promise(resolve => {
                            this.$refs.item[key].validate(res => {
                                resolve(res);
                            });
                        });
                    })
                ).then(res => {
                    const itemVerify = res.every(v => !v == false);

                    if (!valid || !itemVerify) return;

                    const data = {
                        ...this.form,
                        items: this.items.map(item => {
                            return {
                                ...item,
                                fee: parseFloat(item.fee, 10)
                            };
                        })
                    };

                    data.begin_time = +data.begin_time;
                    data.finish_time = +data.finish_time;

                    this.submiting = true;

                    this.onSubmit(data).then(
                        () => {
                            this.submiting = false;
                        },
                        () => {
                            this.submiting = false;
                        }
                    );
                });
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
        }
    },
    watch: {
        detail: {
            deep: true,
            handler(cur) {
                this.form = {
                    title: cur.title ? cur.title : '',
                    category_id: cur.category_id ? cur.category_id : undefined,
                    first_party: cur.first_party ? cur.first_party : '',
                    first_party_linkman: cur.first_party_linkman ? cur.first_party_linkman : '',
                    first_party_phone: cur.first_party_phone ? cur.first_party_phone : '',
                    second_party: cur.second_party ? cur.second_party : '',
                    second_party_linkman: cur.second_party_linkman ? cur.second_party_linkman : '',
                    second_party_phone: cur.second_party_phone ? cur.second_party_phone : '',
                    owner_phone: cur.owner_phone ? cur.owner_phone : '',
                    second_party_wechat_mp_user_id: cur.second_party_wechat_mp_user_id
                        ? cur.second_party_wechat_mp_user_id
                        : undefined,
                    begin_time: cur.begin_time ? cur.begin_time : undefined,
                    finish_time: cur.finish_time ? cur.finish_time : undefined,
                    contract_fee: cur.contract_fee ? cur.contract_fee : 0,
                    is_owner: cur.is_owner ? cur.is_owner : false
                };

                this.items = cur.items ? cur.items : [{}];
            }
        },
        'form.owner_phone'(cur, old) {
            if (/^1\d{10}$/.test(cur)) {
                this.ownerFetching = true;

                utils
                    .request({
                        url: '/option/owner',
                        data: {
                            phone: cur,
                            community_id: this.postInfo.default_community_id
                        },
                        method: 'post'
                    })
                    .then(res => {
                        this.ownerInfo = res.data;
                        this.form.second_party_wechat_mp_user_id = res.data.id;
                        this.ownerFetching = false;
                    })
                    .catch(() => (this.ownerFetching = false));
            } else {
                this.form.second_party_wechat_mp_user_id = null;
            }

            if (!/^1\d{10}$/.test(cur) && /^1\d{10}$/.test(old)) {
                const items = [].concat(this.items);

                items.forEach((row, index) => {
                    items[index].building_id = undefined;
                });

                this.items = items;
            }
        },
        'form.is_owner'(cur) {
            if (!cur) {
                this.ownerInfo = {};
                this.form.owner_phone = undefined;
            }
        },
        'postInfo.default_community_id'() {
            this.getOptions();
        },
        items: {
            deep: true,
            handler(cur) {
                let total = 0;
                cur.forEach(({ fee }) => {
                    if (fee) {
                        total += parseFloat(fee, 10);
                    }
                });

                this.form.contract_fee = total;
            }
        }
    },
    components: {
        Card,
        Button,
        Form,
        Input,
        DatePicker,
        FormField,
        Icon,
        OSwitch: Switch,
        Select,
        Option,
        ContractItemEditor,
        WaterMark
    }
};
</script>

<style lang="less">
.contract-editor {
    @keyframes rotaing {
        0% {
            transform: rotate(0);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .user-input {
        .ivu-input-suffix {
            i {
                color: #2d8cf0;
                animation: rotaing 1.2s linear infinite;
            }
        }
    }

    .item {
        position: relative;
        padding-top: 20px;

        h4 {
            text-align: center;
        }

        .remove {
            position: absolute;
            top: 10px;
            right: 0;
            font-size: 12px;

            > i {
                font-size: 16px;
            }
        }

        & + .item {
            border-top: 1px dashed #eee;
        }
    }
}
</style>
