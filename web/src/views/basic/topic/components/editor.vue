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
            <FormField prop="title" title="专题标题：">
                <Input v-model="form.title" placeholder="请输入专题标题" />
            </FormField>
            <FormField prop="banner_img" title="专题封面：" label="请上传900*300尺寸图片">
                <ImageUpload v-model="form.banner_img" dir="topic" :width="900" :height="300" />
            </FormField>

            <FormField prop="published" title="发布到线上：">
                <OSwitch v-model="form.published" :true-value="1" :false-value="0">
                    <span slot="open">是</span>
                    <span slot="close">否</span>
                </OSwitch>
            </FormField>
            <FormField prop="content" title="专题内容：">
                <Editor v-model="form.content" dir="topic" />
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Card, Form, Input, Switch, Button } from 'view-design';
import { FormField, ImageUpload, Editor } from '@/components';
import formMixin from '@/mixins/form';

export default {
    name: 'TopicEditor',
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
                banner_img: this.detail.banner_img ? this.detail.banner_img : undefined,
                published: this.detail.published ? this.detail.published : 1,
                content: this.detail.content ? this.detail.content : []
            },
            rules: {
                title: [
                    { required: true, message: '请输入专题标题' },
                    { max: 56, message: '专题标题不能超过56个字' }
                ],
                banner_img: [{ required: true, message: '请上传专题封面' }],
                published: [{ required: true, message: '请选择是否发布', type: 'number' }],
                content: [{ required: true, message: '请输入专题内容', type: 'array' }]
            },
            submiting: false
        };
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
    watch: {
        detail: {
            deep: true,
            handler(cur) {
                this.form = {
                    title: cur.title ? cur.title : '',
                    banner_img: cur.banner_img ? cur.banner_img : undefined,
                    published: cur.published ? cur.published : 1,
                    content: cur.content ? cur.content : []
                };
            }
        }
    },
    components: {
        Card,
        Form,
        FormField,
        Input,
        ImageUpload,
        OSwitch: Switch,
        Button,
        Editor
    }
};
</script>

<style lang="less"></style>
