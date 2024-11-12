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

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        complainType: null,
        complainCateogry: null,
        description: '',
        imgList: [],
        // form data end
        uploadImgList: [],
        submiting: false,
        complainTypeActionVisible: false,
        complainTypeName: '',
        complainTypeActions: [
            { name: '投诉', id: 1 },
            { name: '建议', id: 2 }
        ],
        complainCateogryActionVisible: false,
        complainCateogryName: '',
        complainCateogryActions: [
            { name: '卫生', id: 1 },
            { name: '噪音', id: 2 },
            { name: '服务态度', id: 3 },
            { name: '违建', id: 4 },
            { name: '占用消防通道', id: 5 },
            { name: '小区设施', id: 6 },
            { name: '其他', id: 7 }
        ]
    },
    validator: {
        formFields: ['complainType', 'complainCateogry', 'description'],
        formRule: {
            complainType: [{ required: true, message: '请选择反馈类型' }],
            complainCateogry: [{ required: true, message: '请选择反馈分类' }],
            description: [
                { required: true, message: '请输入问题描述' },
                { min: 5, message: '问题描述应大于5个字' },
                { max: 200, message: '问题描述不能超过5个字' }
            ]
        }
    },
    showComplainTypeAction() {
        this.setData({ complainTypeActionVisible: true });
    },
    hideComplainTypeAction() {
        this.setData({ complainTypeActionVisible: false });
    },
    showComplainCategoryAction() {
        this.setData({ complainCateogryActionVisible: true });
    },
    hideComplainCategoryAction() {
        this.setData({ complainCateogryActionVisible: false });
    },
    onComplainCategoryChange(e) {
        this.setData({
            complainCateogry: e.detail.id,
            complainCateogryName: e.detail.name
        });
    },
    onComplainTypeChange(e) {
        this.setData({
            complainType: e.detail.id,
            complainTypeName: e.detail.name
        });
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList, imgList } = this.data;

        imgList.splice(index, 1);
        uploadImgList.splice(index, 1);

        this.setData({
            imgList,
            uploadImgList
        });
    },
    afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST, uploadImgList, imgList } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        utils.file.md5(file.url).then(hash => {
            const fileName = `complain/${hash}${utils.file.ext(file.url)}`;

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
                            imgList: [].concat(imgList, [`/${sign.key}`])
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

            const send = data => {
                const { communityInfo, description, complainType, complainCateogry, imgList } = this.data;

                utils
                    .request({
                        url: '/complain/create',
                        data: {
                            ...data,
                            type: complainType,
                            category: complainCateogry,
                            description,
                            complain_imgs: imgList,
                            community_id: communityInfo.current.community_id
                        },
                        method: 'post'
                    })
                    .then(
                        res => {
                            this.setData({ submiting: false });
                            $toast.clear();
                            wx.redirectTo({ url: `/pages/complain/detail?id=${res.data.id}` });
                        },
                        res => {
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                            $toast.clear();
                            this.setData({ submiting: false });
                        }
                    );
            };

            wx.getSetting({
                withSubscriptions: true,
                success: res => {
                    utils
                        .request({
                            url: '/complain/tpl',
                            method: 'get'
                        })
                        .then(({ data: tpls }) => {
                            const values = Object.values(tpls);
                            const keys = Object.keys(tpls);
                            const data = {};
                            let gloablSetting = false;

                            // 全局设置啊啊啊
                            if (res.subscriptionsSetting.mainSwitch && res.subscriptionsSetting.itemSettings) {
                                values.forEach((tpl, index) => {
                                    if (tpl in res.subscriptionsSetting) {
                                        data[keys[index]] =
                                            res.subscriptionsSetting.itemSettings[tpl] === 'accept' ? 1 : 0;
                                        gloablSetting = true;
                                    } else {
                                        data[keys[index]] = 0;
                                    }
                                });
                            }

                            if (gloablSetting) {
                                send(data);
                            } else {
                                wx.requestSubscribeMessage({
                                    tmplIds: values,
                                    success: res => {
                                        values.forEach((tpl, index) => {
                                            data[keys[index]] = res[tpl] === 'accept' ? 1 : 0;
                                        });
                                        send(data);
                                    },
                                    fail: () => {
                                        $toast.clear();
                                        $notify({
                                            type: 'danger',
                                            message: '系统异常，请重试'
                                        });
                                        this.setData({ submiting: false });
                                    }
                                });
                            }
                        });
                },
                fail: () => {
                    $toast.clear();
                    $notify({
                        type: 'danger',
                        message: '系统异常，请重试'
                    });
                    this.setData({ submiting: false });
                }
            });
        });
    }
});
