<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="采购信息">
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
                <FormField prop="community_id" title="申请人：">
                    {{ userInfo.real_name }}
                </FormField>
                <FormField prop="remark" title="采购备注：">
                    <Input
                        type="textarea"
                        :rows="3"
                        v-model="form.remark"
                        show-word-limit
                        :maxlength="512"
                        placeholder="请输入本次采购申请的备注信息，非必填"
                    />
                </FormField>
                <FormField title="采购总金额：" prop="total" width="300">
                    <Input v-model="form.total" readonly />
                </FormField>
            </Form>
        </Card>

        <Card dis-hover :bordered="false" title="采购项目" class="mt-16">
            <a slot="extra" @click="addItem">
                <Icon type="ios-add-circle-outline" />
                添加项目
            </a>
            <div v-for="(item, key) in items" :key="key" class="purchase-item">
                <PurchaseItem ref="item" :detail="item" v-model="items[key]" :options="options" :index="key + 1" />
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
import { Header, FormField, WaterMark } from '@/components';
import { Card, Button, Input, DatePicker, Message, Form, Icon } from 'view-design';
import * as utils from '@/utils';
import formMixin from '@/mixins/form';
import PurchaseItem from './components/item';

export default {
    name: 'OaPurchaseApply',
    data() {
        return {
            form: {
                remark: '',
                total: 0
            },
            items: [{}],
            rules: {
                remark: [{ max: 512, message: '采购备注不得超过512个字' }],
                total: [{ required: true, type: 'number', message: '请输入采购内容' }]
            },
            submiting: false,
            options: {
                material: [],
                supplier: []
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
            utils.request.post('/purchase/option', { community_id: this.postInfo.default_community_id }).then(res => {
                this.options.material = res.data.material;
                this.options.supplier = res.data.supplier;
            });
        },
        addItem() {
            this.items.push({});
        },
        removeItem(index) {
            if (this.items.length === 1) {
                return Message.warning('至少要有一个采购项目');
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
                                total: parseInt(item.total, 10),
                                fee: parseFloat(item.fee, 10)
                            };
                        })
                    };

                    this.submiting = true;

                    utils
                        .request({
                            url: '/purchase/create',
                            data,
                            method: 'post'
                        })
                        .then(res => {
                            this.submiting = false;
                            this.$router.push(`/oa/material/purchase/${res.data.id}`);
                            Message.success('采购申请成功');
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
        PurchaseItem
    }
};
</script>

<style lang="less">
.purchase-item {
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

    & + .purchase-item {
        border-top: 1px dashed #eee;
    }
}
</style>
