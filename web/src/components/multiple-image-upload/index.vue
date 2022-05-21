<template>
    <div class="multiple-image-upload">
        <div class="item" v-for="(item, index) in result" :key="index">
            <Progress v-if="item.progress !== 100" :percent="item.progress" hide-info />
            <div v-else>
                <img v-lazy="item.url" />

                <div class="cover">
                    <Icon type="ios-eye-outline" @click.native="preview(index)"></Icon>
                    <Icon type="ios-trash-outline" @click.native="remove(index)"></Icon>
                </div>
            </div>
        </div>

        <Upload
            v-if="result.length !== max"
            class="item"
            accept="image/*"
            :show-upload-list="false"
            ref="upload"
            :before-upload="onBeforeUpload"
            action="/"
            multiple
        >
            <div class="upload-trigger">
                <Icon type="ios-camera" size="20"></Icon>
            </div>
        </Upload>

        <div class="preview" v-if="visible">
            <div class="img">
                <img :src="result[previewIndex].url" />
            </div>
            <div class="close" @click="closePreview">
                <Icon type="ios-close-circle-outline" />
            </div>
        </div>
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
import axios from 'axios';

export default {
    name: 'MultipleImageUpload',
    props: {
        value: Array,
        max: {
            type: Number,
            default: 4
        },
        dir: {
            type: String,
            required: true
        }
    },
    data() {
        const result = (this.value ? this.value : []).map(key => {
            return {
                name: key,
                url: `${ASSET_HOST}${key}`,
                progress: 100
            };
        });

        return {
            result,
            visible: false,
            previewIndex: -1,
            total: result.length
        };
    },
    mixins: [Emitter],
    methods: {
        onBeforeUpload(file) {
            if (this.total === this.max) {
                Message.error(`最多允许上传${this.max}张图片`);
                return false;
            }
            this.total++;

            utils.image.parse(file).then(
                img => {
                    const key = `${this.dir}/${img.hash}${img.ext}`;

                    this.result.unshift({
                        name: `/${key}`,
                        url: `${ASSET_HOST}/${key}`,
                        progress: 0,
                        uuid: img.hash
                    });

                    file.uuid = img.hash;

                    utils.oss(key).then(res => {
                        const fd = new FormData();

                        for (let key in res) {
                            fd.append(key, res[key]);
                        }

                        fd.append('file', file);

                        axios({
                            url: ASSET_HOST,
                            method: 'post',
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            },
                            onUploadProgress: e => this.onUploadProgress(e, file),
                            data: fd
                        })
                            .then(() => this.onUploadSuccess())
                            .catch(() => this.onUploadError(file));
                    });
                },
                () => this.onUploadError(file)
            );

            return false;
        },
        onUploadProgress(e, file) {
            const index = this.result.findIndex(item => item.uuid === file.uuid);
            this.result[index].progress = Math.floor((e.loaded / e.total) * 100);
        },
        onUploadSuccess() {
            setTimeout(() => {
                this.trigger();
            }, 1000);
        },
        trigger() {
            const val = [];
            this.result.forEach(item => {
                if (item.progress === 100) {
                    val.push(item.name);
                }
            });

            this.$emit('input', val);
            this.$emit('on-change', val);
            this.dispatch('FormItem', 'on-form-change', val);
            if (this.$refs.upload) {
                this.$refs.upload.clearFiles();
            }
        },
        onUploadError(file) {
            Message.error('上传错误！');
            const index = this.result.findIndex(item => item.uuid === file.uuid);
            this.result.splice(index, 1);
            this.total--;
            this.trigger();
        },
        preview(index) {
            this.visible = true;
            this.previewIndex = index;
            window.addEventListener('keydown', this.onKeyDown, false);
        },
        onKeyDown(e) {
            if (e.keyCode === 27) {
                this.closePreview();
            }
        },
        remove(index) {
            this.result.splice(index, 1);
            this.total--;
            this.trigger();
        },
        closePreview() {
            this.visible = false;
            window.removeEventListener('keydown', this.onKeyDown);
        }
    },
    watch: {
        value(cur) {
            this.result = cur.map(key => {
                return {
                    name: key,
                    url: `${ASSET_HOST}${key}`,
                    progress: 100
                };
            });
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
.multiple-image-upload {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;

    .upload-trigger {
        width: 58px;
        height: 58px;
        border-radius: 4px;
        border: 1px dashed #dcdee2;
        text-align: center;
        line-height: 56px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border: 1px dashed #2d8cf0;
            color: #2d8cf0;
        }
    }

    .item {
        margin: 8px 0;
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        &:not(.ivu-upload) {
            width: 58px;
            height: 58px;
            border: 1px solid #dcdee2;
            border-radius: 4px;
        }

        img {
            max-width: 56px;
            max-height: 56px;
        }

        & + .item {
            margin-left: 12px;
        }

        .cover {
            display: none;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            line-height: 58px;
            right: 0;
            background: rgba(0, 0, 0, 0.6);
        }

        &:hover .cover {
            display: block;
        }

        .cover i {
            cursor: pointer;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            margin: 0 2px;
        }
    }

    .preview {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .close {
            font-size: 20px;
            color: #fff;
            position: absolute;
            top: 12px;
            right: 12px;
            cursor: pointer;
        }

        .img {
            width: 95vw;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                max-width: 100%;
                max-height: 100vh;
            }
        }
    }
}

@media screen and (max-width: 576px) {
    .multiple-image-upload {
        .preview {
            .img {
                height: 70vh;
            }
        }
    }
}
</style>
