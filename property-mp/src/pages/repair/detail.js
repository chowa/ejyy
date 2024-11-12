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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';
import ROLES from '../../constants/role';

CwPage({
    data: {
        ASSETS_HOST,
        ROLES,
        id: null,
        fetching: true,
        steps: [{ text: '业主报修' }, { text: '工单分配' }, { text: '工单确认' }, { text: '工单完成' }],
        detail: {},
        dispose_reply: '',
        dispose_content: '',
        dispose_imgs: [],
        uploadImgList: [],
        submiting: false,
        loaded: false
    },
    validator: {
        formFields: ['dispose_content'],
        formRule: {
            dispose_content: [
                { required: true, message: '请输入维修内容' },
                { min: 5, message: '维修内容应大于5个字' },
                { max: 200, message: '维修内容不能超过5个字' }
            ]
        }
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    onLoad(opts) {
        // opts.id = 14;
        this.setData(
            {
                id: opts.id
            },
            () => {
                this.loadData();
            }
        );
    },
    loadData() {
        if (!this.data.id || !this.data.postInfo.default_community_id || this.data.loaded) {
            return Promise.reject();
        }

        this.setData({ loaded: true });

        utils
            .request({
                url: '/repair/my_detail',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    showRepairImg(e) {
        const { index } = e.currentTarget.dataset;

        wx.previewImage({
            current: index,
            urls: this.data.detail.info.repair_imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    },
    showDisposeImg(e) {
        const { index } = e.currentTarget.dataset;

        wx.previewImage({
            current: index,
            urls: this.data.detail.info.dispose_imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    },
    confirmSubmit() {
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
                url: '/repair/confirm',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id,
                    dispose_reply: this.data.dispose_reply
                }
            })
            .then(
                res => {
                    $toast.clear();
                    $notify({
                        type: 'success',
                        message: '确认工单成功'
                    });

                    this.setData({
                        detail: {
                            ...this.data.detail,
                            info: {
                                ...this.data.detail.info,
                                dispose_reply: this.data.dispose_reply,
                                step: 3,
                                disposed_at: res.data.disposed_at
                            }
                        },
                        submiting: false
                    });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                    this.setData({
                        submiting: false
                    });
                }
            );
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList, dispose_imgs } = this.data;

        dispose_imgs.splice(index, 1);
        uploadImgList.splice(index, 1);

        this.setData({
            dispose_imgs,
            uploadImgList
        });
    },
    afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST, uploadImgList, dispose_imgs } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        utils.file.md5(file.url).then(hash => {
            const fileName = `repair/${hash}${utils.file.ext(file.url)}`;

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
                            dispose_imgs: [].concat(dispose_imgs, [`/${sign.key}`])
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
    finishSubmit() {
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
                    url: '/repair/finish',
                    method: 'post',
                    data: {
                        id: this.data.id,
                        community_id: this.data.postInfo.default_community_id,
                        dispose_imgs: this.data.dispose_imgs,
                        dispose_content: this.data.dispose_content
                    }
                })
                .then(
                    res => {
                        $toast.clear();
                        $notify({
                            type: 'success',
                            message: '工单确认完成成功'
                        });

                        this.setData({
                            detail: {
                                ...this.data.detail,
                                info: {
                                    ...this.data.detail.info,
                                    dispose_imgs: this.data.dispose_imgs,
                                    dispose_content: this.data.dispose_content,
                                    step: 4,
                                    finished_at: res.data.finished_at
                                }
                            },
                            submiting: false
                        });
                    },
                    res => {
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                        this.setData({
                            submiting: false
                        });
                    }
                );
        });
    }
});
