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
            <FormField title="文章来源：">{{ community_name }}小区</FormField>
            <FormField prop="title" title="文章标题：">
                <Input v-model="form.title" placeholder="请输入文章标题" />
            </FormField>
            <FormField title="推送首页：" prop="carousel">
                <OSwitch v-model="form.carousel" :true-value="1" :false-value="0">
                    <span slot="open">否</span>
                    <span slot="close">是</span>
                </OSwitch>
            </FormField>
            <FormField title="封面图片：" prop="cover_img" v-if="form.carousel" label="请上传1200*712像素图片">
                <ImageUpload v-model="form.cover_img" dir="inform" :width="1200" :height="712" />
            </FormField>
            <FormField title="发布：" prop="published">
                <OSwitch v-model="form.published" :true-value="1" :false-value="0">
                    <span slot="open">否</span>
                    <span slot="close">是</span>
                </OSwitch>
            </FormField>
            <FormField prop="content" title="文章内容：">
                <Editor v-model="form.content" dir="inform" />
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

import { Card, Form, Input, Button, Switch } from 'view-design';
import { FormField, Editor, ImageUpload } from '@/components';
import formMixin from '@/mixins/form';
import { mapGetters } from 'vuex';

export default {
    name: 'InformEditor',
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
                carousel: this.detail.carousel ? this.detail.carousel : 0,
                cover_img: this.detail.cover_img ? this.detail.cover_img : '',
                published: this.detail.published ? this.detail.published : 0,
                content: this.detail.content ? this.detail.content : []
            },
            rules: {
                title: [
                    { required: true, message: '请输入文章标题' },
                    { max: 56, message: '文章标题不能超过56个字' }
                ],
                cover_img: [{ required: true, message: '请上传封面图片' }],
                carousel: [{ required: true, type: 'number', message: '请选择是否推送首页' }],
                published: [{ required: true, type: 'number', message: '请选择是否发布文章' }],
                content: [{ required: true, message: '请输入文章内容', type: 'array' }]
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
                    carousel: cur.carousel ? cur.carousel : 0,
                    cover_img: cur.cover_img ? cur.cover_img : '',
                    published: cur.published ? cur.published : 0,
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
        Button,
        Editor,
        OSwitch: Switch,
        ImageUpload
    }
};
</script>
