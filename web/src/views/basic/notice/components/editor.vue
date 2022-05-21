<template>
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
            <FormField title="通知范围：">{{ community_name }}小区</FormField>
            <FormField prop="title" title="通知标题：">
                <Input v-model="form.title" placeholder="请输入通知标题" />
            </FormField>
            <FormField prop="overview" title="通知概述：">
                <Input v-model="form.overview" type="textarea" :rows="5" placeholder="请输入通知概述" />
            </FormField>
            <FormField title="发布：" prop="published">
                <OSwitch v-model="form.published" :true-value="1" :false-value="0">
                    <span slot="open">否</span>
                    <span slot="close">是</span>
                </OSwitch>
            </FormField>
            <FormField
                title="公众号推送："
                prop="oa_tpl_msg"
                label="当前仅支持停水停电通知，非严重影响业主生活情况不准使用本功能"
            >
                <OSwitch v-model="form.oa_tpl_msg">
                    <span slot="open">否</span>
                    <span slot="close">是</span>
                </OSwitch>
            </FormField>
            <FormField title="推送模板：" prop="tpl" v-if="form.oa_tpl_msg">
                <Select placeholder="请选择推送模板" v-model="form.tpl">
                    <Option v-for="item in tplList" :key="item.tpl" :value="item.tpl">{{ item.title }}</Option>
                </Select>
            </FormField>
            <FormField title="模板内容：" prop="tpl_content" v-if="form.oa_tpl_msg" label="禁止出现不雅词语，违者封号">
                <div class="wechat-tpl-preview">
                    <div class="tpl-content">
                        <h4>{{ tplTitle }}</h4>

                        <div v-for="(item, index) in form.tpl_content" :key="index" class="row">
                            <span v-if="item.label">{{ item.label }}：</span>
                            <Input
                                :placeholder="'{{' + item.key + '.' + item.type + '}}'"
                                v-model="form.tpl_content[index].value"
                            />
                        </div>
                    </div>
                    <div class="to-mp">
                        <span>详情</span>
                        <Icon type="ios-arrow-forward" />
                    </div>
                </div>
            </FormField>
            <FormField prop="content" title="通知内容：">
                <Editor v-model="form.content" dir="notice" />
            </FormField>

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="submit">
                    {{ !update ? '发布' : '更新' }}
                </Button>
            </div>
        </Form>
    </Card>
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

import { Card, Form, Input, Button, Switch, Select, Option, Icon } from 'view-design';
import { FormField, Editor } from '@/components';
import formMixin from '@/mixins/form';
import { mapGetters } from 'vuex';
import * as utils from '@/utils';

export default {
    name: 'NoticeEditor',
    props: {
        update: Boolean,
        onSubmit: Function,
        detail: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    data() {
        return {
            labelWidth: 160,
            form: {
                title: this.detail.title ? this.detail.title : '',
                overview: this.detail.overview ? this.detail.overview : undefined,
                published: this.detail.published ? this.detail.published : 0,
                oa_tpl_msg: this.detail.notice_tpl_id ? true : false,
                tpl: this.detail.tpl ? this.detail.tpl : '',
                tpl_content: this.detail.tpl_content ? this.detail.tpl_content : [],
                content: this.detail.content ? this.detail.content : []
            },
            rules: {
                title: [
                    { required: true, message: '请输入通知标题' },
                    { max: 56, message: '通知标题不能超过56个字' }
                ],
                published: [{ required: true, type: 'number', message: '请选择是否发布通知' }],
                overview: [
                    { required: true, message: '请输入通知概述' },
                    { max: 128, message: '通知概述不能超过128个字' }
                ],
                oa_tpl_msg: [{ required: true, type: 'boolean', message: '请选择是否公众号群发 ' }],
                tpl: [{ required: true, message: '请选择推送模板' }],
                tpl_content: [
                    {
                        required: true,
                        type: 'array',
                        message: '请输入模板内容',
                        validator: (rule, val, cb) => {
                            const pass = val.every(item => !!item.value);

                            if (pass) {
                                cb();
                            } else {
                                cb(new Error('请输入模板内容'));
                            }
                        }
                    }
                ],
                content: [{ required: true, message: '请输入通知内容', type: 'array' }]
            },
            tplTitle: '',
            tplList: [],
            submiting: false
        };
    },
    created() {
        utils.request.get('/notice/tpl').then(res => {
            this.tplList = res.data.list;
        });
    },
    mixins: [formMixin],
    methods: {
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    return;
                }

                this.submiting = true;

                this.onSubmit(this.form).then(
                    () => {
                        this.submiting = false;
                    },
                    () => {
                        this.submiting = false;
                    }
                );
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
                    overview: cur.overview ? cur.overview : undefined,
                    published: cur.published ? cur.published : 0,
                    oa_tpl_msg: cur.notice_tpl_id ? true : false,
                    tpl: cur.tpl ? cur.tpl : '',
                    tpl_content: cur.tpl_content ? cur.tpl_content : [],
                    content: cur.content ? cur.content : []
                };
            }
        },
        'form.tpl'(cur) {
            const index = this.tplList.findIndex(item => item.tpl === cur);
            if (index < 0) return;
            this.tplTitle = this.tplList[index].title;

            if (this.update) {
                this.form.tpl_content = this.tplList[index].content.map((item, index) => {
                    return {
                        ...item,
                        value: this.detail.notice_tpl_id ? this.detail.tpl_content[index].value : ''
                    };
                });
            } else {
                this.form.tpl_content = this.tplList[index].content;
            }
        }
    },
    components: {
        Card,
        Form,
        FormField,
        Input,
        Button,
        Editor,
        OSwitch: Switch,
        Select,
        Option,
        Icon
    }
};
</script>

<style lang="less">
.wechat-tpl-preview {
    max-width: 320px;
    width: 320px;
    border: 1px solid #e3e4e5;

    .tpl-content {
        padding: 18px 20px;

        h4 {
            height: 26px;
            margin-bottom: 12px;
        }

        .row {
            display: flex;
            flex-direction: row;

            > span {
                flex: none;
            }
        }
    }

    .to-mp {
        padding: 6px 20px;
        border-top: 1px solid #e3e4e5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        color: #999;
    }
}
</style>
