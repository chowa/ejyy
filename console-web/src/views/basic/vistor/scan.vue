<template>
    <section class="vistor-scan">
        <Header />

        <Card dis-hover :bordered="false">
            <Upload
                action="/"
                type="drag"
                accept="image/*"
                :before-upload="verify"
                class="upload"
                :show-upload-list="false"
                v-if="!finish"
            >
                <Icon type="ios-cloud-upload" />
                <p>点击或拖拽访客码到此处上传验证</p>
            </Upload>
            <Result :title="message" v-else :type="error ? 'error' : 'success'">
                <div slot="actions" v-if="detailId">
                    <Button @click="goDetail" type="primary">查看访客详细</Button>
                </div>
            </Result>
        </Card>

        <canvas ref="canvas" v-show="false" />

        <Spin size="large" fix v-if="fetching" />
    </section>
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

import { mapGetters } from 'vuex';
import { Header, Result } from '@/components';
import { Card, Upload, Icon, Spin, Message, Button } from 'view-design';
import * as utils from '@/utils';
import jsQr from 'jsqr';

export default {
    name: 'BasicVistorScan',
    data() {
        return {
            fetching: false,
            finish: false,
            error: false,
            message: '',
            detailId: null
        };
    },
    methods: {
        verify(file) {
            this.fetching = true;

            const url = window.URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                this.$refs.canvas.width = img.width;
                this.$refs.canvas.height = img.height;

                const ctx = this.$refs.canvas.getContext('2d');

                ctx.clearRect(0, 0, img.width, img.height);
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imgData = ctx.getImageData(0, 0, img.width, img.height);
                const code = jsQr(imgData.data, img.width, img.height);

                if (!code) {
                    this.fetching = false;
                    return Message.error('请上传二维码图片！');
                }

                const data = {
                    community_id: this.postInfo.default_community_id,
                    uid: code.data
                };

                utils.request
                    .post('/vistor/scan', data)
                    .then(res => {
                        this.finish = true;
                        this.fetching = false;
                        this.error = false;
                        this.message = res.message;
                        this.detailId = res.data.id;
                    })
                    .catch(res => {
                        this.finish = true;
                        this.fetching = false;
                        this.error = true;
                        this.message = res.message;
                        this.detailId = res.data.id;
                    });
            };

            img.src = url;

            return false;
        },
        goDetail() {
            this.$router.push(`/basic/vistor/detail/${this.detailId}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    components: {
        Header,
        Card,
        Result,
        Upload,
        Icon,
        Button,
        Spin
    }
};
</script>

<style lang="less">
.vistor-scan {
    .upload {
        .ivu-upload-drag {
            padding: 32px 0;
        }

        i {
            font-size: 52px;
            color: #3399ff;
        }

        p {
            margin-top: 12px;
        }
    }
}
</style>
