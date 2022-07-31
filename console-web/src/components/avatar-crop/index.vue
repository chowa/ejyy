<template>
    <div class="avatar-crop">
        <img :src="ASSET_HOST + result" v-if="!uploading && result" class="preview" :style="previewStyle" />

        <Button :loading="uploading" @click="selectImage">
            <input type="file" accept="image/*" v-show="false" @change="handleChange" ref="fileinput" />
            <Icon type="ios-cloud-upload-outline" :size="18" />
            <span>{{ !this.result ? text : updateText }}</span>
        </Button>

        <Modal v-model="visible" :title="title">
            <div class="main-crop">
                <Row>
                    <Col :lg="14" :sm="14" :xs="24">
                        <div class="main-crop-opeatre">
                            <div class="main-img-container" @wheel.prevent="handleMouseWheel">
                                <img
                                    :src="sourceImgUrl"
                                    :style="sourceImgStyle"
                                    class="main-img"
                                    draggable="false"
                                    @drag="preventDefault"
                                    @dragstart="preventDefault"
                                    @dragend="preventDefault"
                                    @dragleave="preventDefault"
                                    @dragover="preventDefault"
                                    @dragenter="preventDefault"
                                    @drop="preventDefault"
                                    @touchstart="imgStartMove"
                                    @touchmove="imgMove"
                                    @touchend="createImg"
                                    @touchcancel="createImg"
                                    @mousedown="imgStartMove"
                                    @mousemove="imgMove"
                                    @mouseup="createImg"
                                    @mouseout="createImg"
                                    ref="img"
                                />
                                <div class="main-img-shade main-img-shade-1" :style="sourceImgShadeStyle"></div>
                                <div class="main-img-shade main-img-shade-2" :style="sourceImgShadeStyle"></div>
                            </div>

                            <div class="main-range">
                                <input
                                    type="range"
                                    v-model="scale.range"
                                    step="1"
                                    min="0"
                                    max="100"
                                    @change="zoomChange"
                                    @mousemove="zoomChange"
                                />
                                <i
                                    @mousedown="startZoomSub"
                                    @mouseout="endZoomSub"
                                    @mouseup="endZoomSub"
                                    class="main-icon5"
                                ></i>
                                <i
                                    @mousedown="startZoomAdd"
                                    @mouseout="endZoomAdd"
                                    @mouseup="endZoomAdd"
                                    class="main-icon6"
                                ></i>
                            </div>

                            <div class="main-rotate" v-if="!noRotate">
                                <i @click="rotateImg">↻</i>
                            </div>
                        </div>
                    </Col>
                    <Col :lg="10" :sm="10" :xs="24">
                        <div class="main-crop-preview" v-show="true" v-if="preview">
                            <div class="main-preview">
                                <div class="main-preview-item main-preview-item-circle">
                                    <img :src="createImgUrl" :style="previewStyle" />
                                    <span>裁剪预览</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Progress :percent="progress" status="active" v-if="uploading" />
            </div>

            <div slot="footer">
                <Button @click="cancel">取消</Button>
                <Button type="primary" @click="confirm" :loading="uploading">裁剪</Button>
            </div>
        </Modal>

        <canvas ref="canvas" :width="width" :height="height" v-show="false" />
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

import { Modal, Button, Icon, Progress, Row, Col, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'AvatarCrop',
    props: {
        value: String,
        dir: {
            type: String,
            required: true
        },
        text: {
            type: String,
            default: '上传头像'
        },
        updateText: {
            type: String,
            default: '修改头像'
        },
        title: {
            type: String,
            default: '头像裁剪'
        },
        // 剪裁图片的宽
        width: {
            type: Number,
            default: 200
        },
        // 剪裁图片的高
        height: {
            type: Number,
            default: 200
        },
        // 不显示旋转功能
        noRotate: {
            type: Boolean,
            default: false
        },
        // 览圆形图片
        preview: {
            type: Boolean,
            default: true
        },
        // 单文件大小限制
        maxSize: {
            type: Number,
            default: 10240
        },
        // 生成图片预览的容器大小
        previewContainer: {
            type: Object,
            default: () => {
                return {
                    width: 100,
                    height: 100
                };
            }
        },
        circle: Boolean
    },
    data() {
        const { width, height } = this;

        return {
            ASSET_HOST,
            uploading: false,
            progress: 0,
            result: this.value,
            visible: false,
            // 浏览器是否支持触屏事件
            // isSupportTouch: document.hasOwnProperty('ontouchstart'),
            // 需求图宽高比
            ratio: width / height,

            // 原图地址、生成图片地址
            sourceImg: null,
            sourceImgUrl: this.initialImgUrl,
            createImgUrl: this.initialImgUrl,

            // 原图片拖动事件初始值
            sourceImgMouseDown: {
                on: false,
                mX: 0, //鼠标按下的坐标
                mY: 0,
                x: 0, //scale原图坐标
                y: 0
            },

            // 原图容器宽高
            sourceImgContainer: {
                // sic
                width: 240,
                height: 184 // 如果生成图比例与此一致会出现bug，先改成特殊的格式吧，哈哈哈
            },

            // 原图展示属性
            scale: {
                zoomAddOn: false, //按钮缩放事件开启
                zoomSubOn: false, //按钮缩放事件开启
                range: 1, //最大100

                x: 0,
                y: 0,
                width: 0,
                height: 0,
                maxWidth: 0,
                maxHeight: 0,
                minWidth: 0, //最宽
                minHeight: 0,
                naturalWidth: 0, //原宽
                naturalHeight: 0
            }
        };
    },
    mixins: [Emitter],
    methods: {
        selectImage() {
            this.$refs.fileinput.click();
        },
        checkFile(file) {
            const { maxSize } = this;

            // 仅限图片
            if (file.type.indexOf('image') === -1) {
                Message.error('请上传能正确的图片');
                return false;
            }

            // 超出大小
            if (file.size / 1024 > maxSize) {
                Message.error('图片大小超出限制');
                return false;
            }
            return true;
        },
        handleChange(e) {
            const files = e.target.files || e.dataTransfer.files;

            if (files.length !== 1) {
                return Message.warning('请上传图片');
            }

            if (this.checkFile(files[0])) {
                this.setSourceImg(files[0]);
            }

            e.preventDefault();
        },
        setSourceImg(file) {
            utils.image.parse(file).then(img => {
                this.sourceImgUrl = img.base64;
                this.startCrop(img.width, img.height, img.instance);
            });
        },
        // 剪裁前准备工作
        startCrop(nWidth, nHeight, img) {
            const { width, height, ratio, scale, sourceImgMasking } = this;
            const sim = sourceImgMasking;
            const nRatio = nWidth / nHeight;
            let w = sim.width;
            let h = sim.height;
            let x = 0;
            let y = 0;

            // 图片像素不达标
            if (nWidth < width || nHeight < height) {
                Message.error(`请上传${width}*${height}以上尺寸图片`);
                this.sourceImgUrl = null;
                return false;
            }

            if (ratio > nRatio) {
                h = w / nRatio;
                y = (sim.height - h) / 2;
            }
            if (ratio < nRatio) {
                w = h * nRatio;
                x = (sim.width - w) / 2;
            }
            scale.range = 0;
            scale.x = x;
            scale.y = y;
            scale.width = w;
            scale.height = h;
            scale.minWidth = w;
            scale.minHeight = h;
            scale.maxWidth = nWidth * sim.scale;
            scale.maxHeight = nHeight * sim.scale;
            scale.naturalWidth = nWidth;
            scale.naturalHeight = nHeight;
            this.sourceImg = img;
            this.visible = true;
            this.createImg();
        },
        // 图片放大放小
        handleMouseWheel(e) {
            e = e || window.event;
            const { scale } = this;
            if (e.wheelDelta) {
                //判断浏览器IE，谷歌滑轮事件
                if (e.wheelDelta > 0) {
                    //当滑轮向上滚动时
                    this.zoomImg(scale.range >= 100 ? 100 : ++scale.range);
                }
                if (e.wheelDelta < 0) {
                    this.zoomImg(scale.range <= 0 ? 0 : --scale.range);
                }
            } else if (e.detail) {
                //Firefox滑轮事件
                if (e.detail > 0) {
                    //当滑轮向上滚动时
                    this.zoomImg(scale.range >= 100 ? 100 : ++scale.range);
                }
                if (e.detail < 0) {
                    this.zoomImg(scale.range <= 0 ? 0 : --scale.range);
                }
            }
        },
        zoomImg(newRange) {
            const { sourceImgMasking, scale } = this;
            const { maxWidth, maxHeight, minWidth, minHeight, width, height, x, y } = scale;
            // 蒙版宽高
            const sWidth = sourceImgMasking.width;
            const sHeight = sourceImgMasking.height;
            // 新宽高
            const nWidth = minWidth + ((maxWidth - minWidth) * newRange) / 100;
            const nHeight = minHeight + ((maxHeight - minHeight) * newRange) / 100;
            // 新坐标（根据蒙版中心点缩放）
            let nX = sWidth / 2 - (nWidth / width) * (sWidth / 2 - x);
            let nY = sHeight / 2 - (nHeight / height) * (sHeight / 2 - y);

            // 判断新坐标是否超过蒙版限制
            if (nX > 0) {
                nX = 0;
            }
            if (nY > 0) {
                nY = 0;
            }
            if (nX < sWidth - nWidth) {
                nX = sWidth - nWidth;
            }
            if (nY < sHeight - nHeight) {
                nY = sHeight - nHeight;
            }

            // 赋值处理
            scale.x = nX;
            scale.y = nY;
            scale.width = nWidth;
            scale.height = nHeight;
            scale.range = newRange;
            setTimeout(() => {
                if (scale.range == newRange) {
                    this.createImg();
                }
            }, 300);
        },
        createImg(e) {
            const {
                imgFormat,
                imgBgc,
                mime,
                sourceImg,
                scale: { x, y, width, height },
                sourceImgMasking: { scale }
            } = this;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            if (e) {
                // 取消鼠标按下移动状态
                this.sourceImgMouseDown.on = false;
            }
            canvas.width = this.width;
            canvas.height = this.height;
            ctx.clearRect(0, 0, this.width, this.height);

            if (imgFormat == 'png') {
                ctx.fillStyle = 'rgba(0,0,0,0)';
            } else {
                // 如果jpg 为透明区域设置背景，默认白色
                ctx.fillStyle = imgBgc;
            }
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.drawImage(sourceImg, x / scale, y / scale, width / scale, height / scale);
            this.createImgUrl = canvas.toDataURL(mime);
        },
        preventDefault(e) {
            e.preventDefault();
            return false;
        },
        // 鼠标按下图片准备移动
        imgStartMove(e) {
            e.preventDefault();
            // 支持触摸事件，则鼠标事件无效
            if (this.isSupportTouch && !e.targetTouches) {
                return false;
            }
            const et = e.targetTouches ? e.targetTouches[0] : e;
            const { sourceImgMouseDown, scale } = this;
            const simd = sourceImgMouseDown;

            simd.mX = et.screenX;
            simd.mY = et.screenY;
            simd.x = scale.x;
            simd.y = scale.y;
            simd.on = true;
        },
        // 鼠标按下状态下移动，图片移动
        imgMove(e) {
            e.preventDefault();
            // 支持触摸事件，则鼠标事件无效
            if (this.isSupportTouch && !e.targetTouches) {
                return false;
            }
            const et = e.targetTouches ? e.targetTouches[0] : e;

            const {
                sourceImgMouseDown: { on, mX, mY, x, y },
                scale,
                sourceImgMasking
            } = this;
            const sim = sourceImgMasking;
            const nX = et.screenX;
            const nY = et.screenY;
            const dX = nX - mX;
            const dY = nY - mY;
            let rX = x + dX;
            let rY = y + dY;

            if (!on) return;
            if (rX > 0) {
                rX = 0;
            }
            if (rY > 0) {
                rY = 0;
            }
            if (rX < sim.width - scale.width) {
                rX = sim.width - scale.width;
            }
            if (rY < sim.height - scale.height) {
                rY = sim.height - scale.height;
            }
            scale.x = rX;
            scale.y = rY;
        },
        // 按钮按下开始放大
        startZoomAdd() {
            const { scale } = this;
            scale.zoomAddOn = true;

            const zoom = () => {
                if (scale.zoomAddOn) {
                    let range = scale.range >= 100 ? 100 : ++scale.range;
                    this.zoomImg(range);
                    setTimeout(() => {
                        zoom();
                    }, 60);
                }
            };
            zoom();
        },
        endZoomAdd() {
            this.scale.zoomAddOn = false;
        },
        // 按钮按下开始缩小
        startZoomSub() {
            const { scale } = this;
            scale.zoomSubOn = true;

            const zoom = () => {
                if (scale.zoomSubOn) {
                    let range = scale.range <= 0 ? 0 : --scale.range;
                    this.zoomImg(range);
                    setTimeout(() => {
                        zoom();
                    }, 60);
                }
            };
            zoom();
        },
        // 按钮松开或移开取消缩小
        endZoomSub() {
            this.scale.zoomSubOn = false;
        },
        zoomChange(e) {
            this.zoomImg(e.target.value);
        },
        // 顺时针旋转图片
        rotateImg() {
            const {
                sourceImg,
                scale: { naturalWidth, naturalHeight }
            } = this;
            const width = naturalHeight;
            const height = naturalWidth;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, width, height);

            ctx.translate(width, 0);
            ctx.rotate((Math.PI * 90) / 180);

            ctx.drawImage(sourceImg, 0, 0, naturalWidth, naturalHeight);
            const imgUrl = canvas.toDataURL('image/jpeg');

            utils.image.parse(this.dataToBlob(imgUrl)).then(img => {
                this.sourceImgUrl = img.base64;
                this.startCrop(img.width, img.height, img.instance);
            });
        },
        dataToBlob(data) {
            data = data.split(',')[1];
            data = window.atob(data);
            var ia = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++) {
                ia[i] = data.charCodeAt(i);
            }
            const file = new Blob([ia], {
                type: 'image/jpeg'
            });
            file.name = `${Date.now()}.jpg`;
            return file;
        },
        confirm() {
            const canvas = this.$refs.canvas;
            const imgUrl = canvas.toDataURL('image/jpeg');
            const file = this.dataToBlob(imgUrl);

            utils.image.parse(file).then(img => {
                const key = `${this.dir}/${img.hash}${img.ext}`;
                const fd = new FormData();
                this.result = `/${key}`;
                this.uploading = true;

                utils.oss(key).then(res => {
                    for (let prop in res) {
                        fd.append(prop, res[prop]);
                    }

                    fd.append('file', file);

                    const xhr = new XMLHttpRequest();
                    xhr.open('post', res.host, true);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== 4) {
                            return;
                        }
                        if (xhr.status === 200 || xhr.status === 201 || xhr.staus === 202) {
                            setTimeout(() => {
                                this.visible = false;
                                this.uploading = false;
                                this.$emit('input', this.result);
                                this.$emit('on-change', this.result);
                                this.dispatch('FormItem', 'on-form-change', this.result);
                            }, 1000);
                        }
                    };
                    xhr.upload.addEventListener(
                        'progress',
                        e => {
                            this.progress = (100 * Math.round(e.loaded)) / e.total;
                        },
                        false
                    ); //监听进度
                    xhr.send(fd);
                });
            });
        },
        cancel() {
            this.visible = false;
        }
    },
    computed: {
        sourceImgStyle() {
            const { scale, sourceImgMasking } = this;
            const top = scale.y + sourceImgMasking.y + 'px';
            const left = scale.x + sourceImgMasking.x + 'px';

            return {
                top,
                left,
                width: scale.width + 'px',
                height: scale.height + 'px' // 兼容 Opera
            };
        },
        // 原图蒙版属性
        sourceImgMasking() {
            const { width, height, ratio, sourceImgContainer } = this;
            const sic = sourceImgContainer;
            const sicRatio = sic.width / sic.height; // 原图容器宽高比
            let x = 0;
            let y = 0;
            let w = sic.width;
            let h = sic.height;
            let scale = 1;

            if (ratio < sicRatio) {
                scale = sic.height / height;
                w = sic.height * ratio;
                x = (sic.width - w) / 2;
            }
            if (ratio > sicRatio) {
                scale = sic.width / width;
                h = sic.width / ratio;
                y = (sic.height - h) / 2;
            }
            return {
                scale, // 蒙版相对需求宽高的缩放
                x,
                y,
                width: w,
                height: h
            };
        },
        // 原图遮罩样式
        sourceImgShadeStyle() {
            const { sourceImgMasking, sourceImgContainer } = this;
            const sic = sourceImgContainer;
            const sim = sourceImgMasking;
            const w = sim.width == sic.width ? sim.width : (sic.width - sim.width) / 2;
            const h = sim.height == sic.height ? sim.height : (sic.height - sim.height) / 2;

            return {
                width: w + 'px',
                height: h + 'px'
            };
        },
        previewStyle() {
            const { ratio, previewContainer, circle } = this;
            const pc = previewContainer;
            let w = pc.width;
            let h = pc.height;
            const pcRatio = w / h;

            if (ratio < pcRatio) {
                w = pc.height * ratio;
            }
            if (ratio > pcRatio) {
                h = pc.width / ratio;
            }
            return {
                width: `${w}px`,
                height: `${h}px`,
                borderRadius: circle ? (w > h ? `${h / 2}px` : `${w / 2}px`) : 'none'
            };
        }
    },
    watch: {
        value(cur) {
            this.result = cur;
        }
    },
    components: {
        Modal,
        Button,
        Icon,
        Progress,
        Row,
        Col
    }
};
</script>

<style lang="less">
.avatar-crop {
    .preview {
        width: 110px;
        height: 110px;
        margin-bottom: 12px;
        background-color: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.15);
        padding: 1px;
    }
}

.main-crop {
    overflow: hidden;

    .main-crop-opeatre {
        .main-img-container {
            position: relative;
            display: block;
            width: 240px;
            height: 180px;
            background-color: #e5e5e0;
            overflow: hidden;
            .main-img {
                position: absolute;
                display: block;
                cursor: move;
                user-select: none;
                max-width: none;

                &-shade {
                    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
                    position: absolute;
                    background-color: rgba(241, 242, 243, 0.8);
                    &.main-img-shade-1 {
                        top: 0;
                        left: 0;
                    }
                    &.main-img-shade-2 {
                        bottom: 0;
                        right: 0;
                    }
                }
            }
        }
        .main-rotate {
            position: relative;
            width: 240px;
            height: 18px;
            i {
                display: block;
                width: 18px;
                height: 18px;
                border-radius: 100%;
                line-height: 18px;
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                background-color: rgba(0, 0, 0, 0.08);
                color: #ffffff;
                overflow: hidden;
                &:hover {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
                    cursor: pointer;
                    background-color: rgba(0, 0, 0, 0.14);
                }
                &:first-child {
                    float: left;
                }
                &:last-child {
                    float: right;
                }
            }
        }
        .main-range {
            position: relative;
            margin: 30px 0 10px 0;
            width: 240px;
            height: 18px;
            .main-icon5,
            .main-icon6 {
                position: absolute;
                top: 0;
                width: 18px;
                height: 18px;
                border-radius: 100%;
                background-color: rgba(0, 0, 0, 0.08);
                &:hover {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
                    cursor: pointer;
                    background-color: rgba(0, 0, 0, 0.14);
                }
            }
            .main-icon5 {
                left: 0;
                &::before {
                    position: absolute;
                    content: '';
                    display: block;
                    left: 3px;
                    top: 8px;
                    width: 12px;
                    height: 2px;
                    background-color: #ffffff;
                }
            }
            .main-icon6 {
                right: 0;
                &::before {
                    position: absolute;
                    content: '';
                    display: block;
                    left: 3px;
                    top: 8px;
                    width: 12px;
                    height: 2px;
                    background-color: #ffffff;
                }
                &::after {
                    position: absolute;
                    content: '';
                    display: block;
                    top: 3px;
                    left: 8px;
                    width: 2px;
                    height: 12px;
                    background-color: #ffffff;
                }
            }
            input[type='range'] {
                display: block;
                padding-top: 5px;
                margin: 0 auto;
                width: 180px;
                height: 8px;
                vertical-align: top;
                background: transparent;
                appearance: none;
                cursor: pointer;
                /* 滑块
							 ---------------------------------------------------------------*/
                /* 轨道
							 ---------------------------------------------------------------*/
                &:focus {
                    outline: none;
                    &::-webkit-slider-runnable-track {
                        background-color: rgba(45, 140, 240, 0.5);
                    }
                    &::-moz-range-track {
                        background-color: rgba(45, 140, 240, 0.5);
                    }
                    &::-ms-fill-lowner {
                        background-color: rgba(45, 140, 240, 0.45);
                    }
                    &::-ms-fill-upper {
                        background-color: rgba(45, 140, 240, 0.25);
                    }
                }
                &::-webkit-slider-thumb {
                    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
                    appearance: none;
                    margin-top: -3px;
                    width: 12px;
                    height: 12px;
                    background-color: #2d8cf0;
                    border-radius: 100%;
                    border: none;
                    transition: 0.2s;
                }
                &::-moz-range-thumb {
                    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background-color: #2d8cf0;
                    border-radius: 100%;
                    border: none;
                    transition: 0.2s;
                }
                &::-ms-thumb {
                    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background-color: #2d8cf0;
                    border: none;
                    border-radius: 100%;
                    transition: 0.2s;
                }
                &:active::-moz-range-thumb {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
                    width: 14px;
                    height: 14px;
                }
                &:active::-ms-thumb {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
                    width: 14px;
                    height: 14px;
                }
                &:active::-webkit-slider-thumb {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
                    margin-top: -4px;
                    width: 14px;
                    height: 14px;
                }
                &::-webkit-slider-runnable-track {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
                    width: 100%;
                    height: 6px;
                    cursor: pointer;
                    border-radius: 2px;
                    border: none;
                    background-color: rgba(45, 140, 240, 0.3);
                }
                &::-moz-range-track {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
                    width: 100%;
                    height: 6px;
                    cursor: pointer;
                    border-radius: 2px;
                    border: none;
                    background-color: rgba(45, 140, 240, 0.3);
                }
                &::-ms-track {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
                    width: 100%;
                    cursor: pointer;
                    background: transparent;
                    border-color: transparent;
                    color: transparent;
                    height: 6px;
                    border-radius: 2px;
                    border: none;
                }
                &::-ms-fill-lowner {
                    background-color: rgba(45, 140, 240, 0.3);
                }
                &::-ms-fill-upper {
                    background-color: rgba(45, 140, 240, 0.15);
                }
            }
        }
    }
    .main-crop-preview {
        padding: 0 12px;
        .main-preview {
            height: 150px;
            overflow: hidden;
            .main-preview-item {
                position: relative;
                padding: 5px;
                width: 100px;
                height: 100px;
                margin-right: 16px;
                span {
                    position: absolute;
                    bottom: -30px;
                    width: 100%;
                    font-size: 14px;
                    color: #bbbbbb;
                    display: block;
                    text-align: center;
                }
                img {
                    position: absolute;
                    display: block;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    margin: auto;
                    padding: 3px;
                    background-color: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    user-select: none;
                    max-width: none;
                }
            }
        }
    }
}
</style>
