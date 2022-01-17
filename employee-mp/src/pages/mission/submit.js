/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        fetching: true,
        id: null,
        detail: {},
        error: false,
        errorMsg: '',
        finish: false,
        step: 0,
        submiting: false,
        // form
        normal: 1,
        remark: '',
        imgs: [],
        // form end
        uploadImgList: []
    },
    validator: {
        formFields: ['normal', 'remark', 'imgs'],
        formRule: {
            normal: [{ required: true, message: '请选择是否存正常', type: 'number' }],
            remark: [{ max: 256, message: '巡检备注不能超过256个字符' }],
            imgs: [{ required: true, type: 'array', min: 1, message: '请上传现场照片' }]
        }
    },
    onLoad(opt) {
        this.setData({
            id: parseInt(opt.id, 10)
        });
    },
    onGlobalDataUpdate() {
        this.getDetail();
    },
    getDetail() {
        if (!this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({
            fetching: true
        });

        return utils
            .request({
                url: '/mission/init',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(
                res => {
                    const step = res.data.point_id
                        ? res.data.lineInfo.findIndex(item => item.id === res.data.point_id) + 1
                        : 0;

                    this.setData({
                        fetching: false,
                        detail: res.data,
                        step
                    });
                },
                res => {
                    this.setData({
                        fetching: false,
                        detail: {},
                        error: true,
                        errorMsg: res.message
                    });

                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onNormalChange(e) {
        this.setData({ normal: e.detail });
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList, imgs } = this.data;

        imgs.splice(index, 1);
        uploadImgList.splice(index, 1);

        this.setData({
            imgs,
            uploadImgList
        });
    },
    afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST, uploadImgList, imgs } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        utils.file.md5(file.url).then(hash => {
            const fileName = `mission/${hash}${utils.file.ext(file.url)}`;

            utils.oss(fileName).then(sign => {
                wx.uploadFile({
                    url: sign.host,
                    filePath: file.url,
                    name: 'file',
                    formData: sign,
                    success: () => {
                        $toast.clear();
                        this.setData({
                            uploadImgList: [].concat(uploadImgList, [
                                {
                                    url: `${ASSETS_HOST}/${sign.key}`
                                }
                            ]),
                            imgs: [].concat(imgs, [`/${sign.key}`])
                        });
                    },
                    fail: () => {
                        $toast.clear();
                        $notify({
                            type: 'danger',
                            message: '上传图片失败，请重试'
                        });
                    }
                });
            });
        });
    },
    submit() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            utils
                .request({
                    url: '/mission/submit',
                    method: 'post',
                    data: {
                        id: this.data.id,
                        community_id: this.data.postInfo.default_community_id,
                        complete_id: this.data.detail.complete_id,
                        point_id: this.data.detail.lineInfo[this.data.step].id,
                        normal: this.data.normal,
                        remark: this.data.remark,
                        img1: this.data.imgs[0],
                        img2: this.data.imgs[1] ? this.data.imgs[1] : undefined,
                        img3: this.data.imgs[2] ? this.data.imgs[2] : undefined
                    }
                })
                .then(
                    res => {
                        $toast.clear();

                        this.setData({
                            normal: 1,
                            remark: '',
                            imgs: [],
                            submiting: false,
                            uploadImgList: [],
                            step: this.data.step + 1,
                            finish: res.data.finish
                        });
                    },
                    res => {
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                        this.setData({
                            submiting: false,
                            error: true,
                            errorMsg: res.message
                        });
                    }
                );
        });
    }
});
