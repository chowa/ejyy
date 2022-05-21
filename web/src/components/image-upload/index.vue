<template>
    <div class="image-upload">
        <Progress :percent="uploadProgress" status="active" v-if="uploading" />
        <div class="image-upload-preview" v-if="!uploading && result">
            <img v-lazy="ASSET_HOST + result" />
        </div>
        <Upload
            :disabled="uploading"
            accept="image/*"
            :show-upload-list="false"
            :action="ASSET_HOST"
            :data="uploadData"
            :on-error="onUploadError"
            :before-upload="onBeforeUpload"
            :on-success="onUploadSuccess"
            :on-progress="onUploadProgress"
            class="upload"
            ref="upload"
        >
            <Button :loading="uploading">
                <Icon type="ios-cloud-upload-outline" :size="18" />
                <span>{{ !this.result ? text : updateText }}</span>
            </Button>
        </Upload>
    </div>
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

import { Upload, Button, Icon, Progress, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'ImageUpload',
    props: {
        width: Number,
        height: Number,
        value: String,
        dir: {
            type: String,
            required: true
        },
        text: {
            type: String,
            default: '上传图片'
        },
        updateText: {
            type: String,
            default: '修改图片'
        }
    },
    data() {
        return {
            ASSET_HOST,
            uploadData: {},
            uploading: false,
            uploadProgress: 0,
            result: this.value
        };
    },
    mixins: [Emitter],
    methods: {
        onBeforeUpload(file) {
            this.uploading = true;
            this.uploadProgress = 0;
            this.result = null;

            return new Promise((resolve, reject) => {
                utils.image.parse(file).then(
                    img => {
                        if (this.width && this.width !== img.width) {
                            Message.error(`请上传${this.width}宽度图片`);
                            this.uploading = false;
                            return reject();
                        } else if (this.height && this.height !== img.height) {
                            Message.error(`请上传${this.height}高度图片`);
                            this.uploading = false;
                            return reject();
                        } else {
                            const key = `${this.dir}/${img.hash}${img.ext}`;
                            this.result = `/${key}`;

                            utils.oss(key).then(res => {
                                this.uploadData = res;
                                resolve();
                            });
                        }
                    },
                    () => {
                        return reject();
                    }
                );
            });
        },
        onUploadProgress(e) {
            this.uploadProgress = Math.floor((e.loaded / e.total) * 100);
        },
        onUploadSuccess() {
            setTimeout(() => {
                this.uploading = false;
                this.$emit('input', this.result);
                this.$emit('on-change', this.result);
                this.dispatch('FormItem', 'on-form-change', this.result);
                this.$refs.upload.clearFiles();
            }, 1000);
        },
        onUploadError() {
            Message.error('上传错误！');
            this.uploading = false;
            this.result = null;
            this.$emit('input', '');
            this.$emit('on-change', '');
            this.dispatch('FormItem', 'on-form-change', '');
            this.$refs.upload.clearFiles();
        }
    },
    watch: {
        value(cur) {
            this.result = cur;
        }
    },
    components: {
        Upload,
        Button,
        Icon,
        Progress
    }
};
</script>

<style lang="less">
.image-upload {
    width: 100%;

    &-preview {
        margin-bottom: 20px;
        overflow: hidden;
        max-width: 680px;

        img {
            max-width: 100%;
        }
    }
}
</style>
