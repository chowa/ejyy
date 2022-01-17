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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

let timer = null;

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        real_name: '',
        idcard: '',
        phone: '',
        nick_name: `业主_${parseInt(Math.random() * 1000, 10)}`,
        signature: '',
        avatar_url: '/avatar/default.png',
        // form data end
        submiting: false
    },
    validator: {
        formFields: ['real_name', 'idcard', 'phone', 'nick_name', 'signature', 'avatar_url'],
        formRule: {
            real_name: [
                { required: true, message: '请输入真实姓名' },
                { max: 8, message: '真实姓名不能超过8个字' }
            ],
            idcard: [
                { required: true, message: '请输入身份证号码' },
                { pattern: /^\d{17}(x|X|\d){1}$/, message: '请输入正确的身份证号码' }
            ],
            phone: [{ required: true, message: '请授权获取您的手机号码' }],
            nick_name: [
                { required: true, message: '请输入昵称' },
                { max: 12, message: '昵称不能超过12个字' }
            ],
            signature: [
                { required: true, message: '请输入签名' },
                { max: 36, message: '昵称不能超过36个字' }
            ],
            avatar_url: [{ required: true, message: '请上传头像' }]
        }
    },
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }

        this.getLoginCode();
    },
    onHide() {
        this.clearGetLoginCode();
    },
    clearGetLoginCode() {
        clearTimeout(timer);
        timer = null;
    },
    getLoginCode() {
        wx.login({
            success: ({ code }) => {
                this.setData({ loginCode: code });

                if (!this.data.phone) {
                    timer = setTimeout(() => {
                        this.getLoginCode();
                    }, 4.5 * 60 * 10000);
                } else {
                    this.clearGetLoginCode();
                }
            }
        });
    },
    onGlobalDataUpdate() {
        this.setData({
            nick_name: this.data.nick_name ? this.data.nick_name : this.data.userInfo.nick_name,
            signature: this.data.signature ? this.data.signature : this.data.userInfo.signature,
            phone: this.data.userInfo.phone
        });
    },
    getPhoneNumber(e) {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '手机绑定中…'
        });

        utils
            .request({
                url: '/user/bind_phone',
                method: 'post',
                data: {
                    code: this.data.loginCode,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                }
            })
            .then(
                res => {
                    $toast.clear();

                    this.bridge.updateData({
                        userInfo: {
                            ...this.data.userInfo,
                            phone: res.data.phone
                        }
                    });
                },
                () => {
                    $toast.clear();
                }
            );
    },
    selectImage() {
        wx.navigateTo({
            url: '/pages/zone/avatar'
        });
    },
    useWechatInfo() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '获取中…'
        });

        wx.getUserProfile({
            desc: '用于完善用户信息',
            success: res => {
                this.setData({
                    nick_name: res.userInfo.nickName
                });

                wx.downloadFile({
                    url: res.userInfo.avatarUrl,
                    success: res => {
                        utils.file.md5(res.tempFilePath).then(hash => {
                            const fileName = `avatar/${hash}${utils.file.ext(res.tempFilePath)}`;

                            utils.oss(fileName).then(sign => {
                                wx.uploadFile({
                                    url: sign.host,
                                    filePath: res.tempFilePath,
                                    name: 'file',
                                    formData: sign,
                                    success: () => {
                                        this.setData({
                                            avatar_url: `/${sign.key}`
                                        });
                                        $toast.clear();
                                    },
                                    fail: res => {
                                        $toast.clear();
                                        $notify({
                                            type: 'danger',
                                            message: '获取微信头像失败'
                                        });
                                    }
                                });
                            });
                        });
                    },
                    fail: () => {
                        $notify({
                            type: 'danger',
                            message: '获取微信头像失败'
                        });
                        $toast.clear();
                    }
                });
            },
            fail: () => {
                $toast.clear();
            }
        });
    },
    save() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            const { nick_name, signature, real_name, idcard, avatar_url, userInfo } = this.data;

            utils
                .request({
                    url: '/user/supplement',
                    method: 'post',
                    data: {
                        nick_name,
                        signature,
                        real_name,
                        idcard,
                        avatar_url
                    }
                })
                .then(
                    res => {
                        this.bridge.updateData({
                            userInfo: {
                                ...userInfo,
                                nick_name,
                                signature,
                                avatar_url,
                                intact: true,
                                gender: res.data.gender
                            }
                        });

                        this.setData({
                            submiting: false
                        });

                        $toast.clear();

                        wx.redirectTo({
                            url: '/pages/community/binding'
                        });
                    },
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                    }
                );
        });
    }
});
