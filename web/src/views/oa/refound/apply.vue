<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="报销信息">
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
                <FormField prop="community_id" title="报销人：">
                    {{ userInfo.real_name }}
                </FormField>
                <FormField prop="range" title="费用产生时间：">
                    <DatePicker
                        type="daterange"
                        format="yyyy年MM月dd"
                        style="width:100%"
                        v-model="form.range"
                        :options="{ disabledDate: d => d > Date.now() }"
                        placeholder="请选择费用产生时间"
                    />
                </FormField>
                <FormField prop="reason" title="报销原因：">
                    <Input
                        type="textarea"
                        :rows="3"
                        v-model="form.reason"
                        show-word-limit
                        :maxlength="128"
                        placeholder="请输入报销原因，如出差住宿餐饮、项目需要"
                    />
                </FormField>
                <FormField title="报销总金额：" prop="total" width="300">
                    <Input v-model="form.total" readonly />
                </FormField>
            </Form>
        </Card>

        <Card dis-hover :bordered="false" title="报销项目" class="mt-16">
            <a slot="extra" @click="addItem">
                <Icon type="ios-add-circle-outline" />
                添加项目
            </a>
            <div v-for="(item, key) in items" :key="key" class="refound-item">
                <RefoundItem ref="item" :detail="item" v-model="items[key]" :index="key + 1" />
                <a @click="removeItem(key)" class="remove">
                    <Icon type="ios-trash-outline" />
                    删除项目{{ key + 1 }}
                </a>
            </div>
        </Card>

        <div class="cw-form-actions">
            <Button type="primary" :loading="submiting" @click="submit">
                提交申请
            </Button>
        </div>
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
import { Header, FormField, WaterMark } from '@/components';
import { Card, Button, Input, DatePicker, Message, Form, Icon } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import RefoundItem from './components/item';

export default {
    name: 'RefoundApply',
    data() {
        return {
            form: {
                range: [],
                reason: '',
                total: 0
            },
            items: [{}],
            rules: {
                range: [
                    { required: true, type: 'array', message: '请选择费用产生时间' },
                    {
                        validator: (rule, val, cb) => {
                            if (val.length === 2 && val[0] && val[1]) {
                                cb();
                            } else {
                                cb(new Error('请选择费用产生时间'));
                            }
                        },
                        message: '请选择费用产生时间'
                    }
                ],
                reason: [
                    { required: true, message: '请输入报销原因' },
                    { max: 128, message: '报销原因不得超过128个字' }
                ],
                total: [{ required: true, type: 'number', message: '请输入报销内容' }]
            },
            submiting: false
        };
    },
    mixins: [formMixin],
    methods: {
        addItem() {
            this.items.push({});
        },
        removeItem(index) {
            if (this.items.length === 1) {
                return Message.warning('至少要有一个报销项目');
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
                        community_id: this.postInfo.default_community_id,
                        ...this.form,
                        items: this.items.map(item => {
                            return {
                                ...item,
                                fee: parseFloat(item.fee, 10)
                            };
                        })
                    };

                    data.begin_date = +data.range[0];
                    data.finish_date = +data.range[1];

                    delete data.range;

                    this.submiting = true;

                    utils
                        .request({
                            url: '/refound/create',
                            data,
                            method: 'post'
                        })
                        .then(res => {
                            this.submiting = false;
                            this.$router.push(`/oa/refound/detail/${res.data.id}`);
                            Message.success('报销申请成功');
                        })
                        .catch(() => (this.submiting = false));
                });
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
        items: {
            deep: true,
            handler(cur) {
                let total = 0;
                cur.forEach(({ fee }) => {
                    if (fee) {
                        total += parseFloat(fee, 10);
                    }
                });

                this.form.total = total;
            }
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
        Icon,
        RefoundItem
    }
};
</script>

<style lang="less">
.refound-item {
    position: relative;
    padding-top: 20px;

    .remove {
        position: absolute;
        top: 10px;
        right: 0;
        font-size: 12px;

        > i {
            font-size: 16px;
        }
    }

    h4 {
        text-align: center;
    }

    & + .refound-item {
        border-top: 1px dashed #eee;
    }
}
</style>
