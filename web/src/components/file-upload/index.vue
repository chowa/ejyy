<template>
    <div class="file-upload">
        <Progress :percent="uploadProgress" status="active" v-if="uploading" />
        <a class="file-upload-download" src="ASSET_HOST + result" v-if="!uploading && result">
            {{ fileName }}
        </a>
        <Upload
            :disabled="uploading"
            accept=".doc,.docx,.pdf,.xls,.xlsx"
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
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Upload, Button, Icon, Progress, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'FileUpload',
    props: {
        width: Number,
        height: Number,
        value: {
            type: Object,
            default: () => {
                return {
                    url: undefined,
                    name: undefined
                };
            }
        },
        dir: {
            type: String,
            required: true
        },
        onUploadStart: {
            type: Function
        },
        onUploadEnd: {
            type: Function
        },
        text: {
            type: String,
            default: '上传附件'
        },
        updateText: {
            type: String,
            default: '修改附件'
        }
    },
    data() {
        return {
            ASSET_HOST,
            uploadData: {},
            uploading: false,
            uploadProgress: 0,
            fileName: '',
            result: this.value
        };
    },
    mixins: [Emitter],
    methods: {
        onBeforeUpload(file) {
            this.uploading = true;
            this.uploadProgress = 0;
            this.result = null;
            this.fileName = file.name;

            return new Promise((resolve, reject) => {
                utils.file.parse(file).then(
                    params => {
                        const key = `${this.dir}/${params.hash}${params.ext}`;
                        this.result = `/${key}`;

                        utils.oss(key).then(res => {
                            this.uploadData = res;
                            resolve();
                        });
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
                const result = {
                    url: this.result,
                    name: this.fileName
                };

                this.uploading = false;
                this.$emit('input', result);
                this.$emit('on-change', result);
                this.dispatch('FormItem', 'on-form-change', result);
                this.$refs.upload.clearFiles();
            }, 1000);
        },
        onUploadError() {
            const result = {
                url: undefined,
                name: undefined
            };
            Message.error('上传错误！');
            this.uploading = false;
            this.result = null;
            this.fileName = null;

            this.$emit('input', result);
            this.$emit('on-change', result);
            this.dispatch('FormItem', 'on-form-change', result);
            this.$refs.upload.clearFiles();
        }
    },
    watch: {
        value(cur) {
            this.result = cur.url;
            this.fileName = cur.name;
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
.file-upload {
    width: 100%;

    &-download {
        margin-bottom: 20px;
    }
}
</style>
