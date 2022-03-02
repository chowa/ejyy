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
import $toast from '../../components/toast/toast';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        nick_name: '',
        signature: '',
        avatar_url: '',
        // form data end
        submiting: false
    },
    validator: {
        formFields: ['nick_name', 'signature', 'avatar_url'],
        formRule: {
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
    selectImage() {
        wx.navigateTo({
            url: '/pages/zone/avatar'
        });
    },
    onChange() {
        const { nick_name, signature, userInfo, avatar_url } = this.data;

        if (
            nick_name.length === 0 ||
            signature.length === 0 ||
            !avatar_url ||
            (nick_name === userInfo.nick_name && signature === userInfo.signature && avatar_url === userInfo.avatar_url)
        ) {
            this.setData({
                disabled: true
            });
        } else {
            this.setData({
                disabled: false
            });
        }
    },
    onGlobalDataUpdate() {
        this.setData({
            nick_name: this.data.userInfo.nick_name,
            signature: this.data.userInfo.signature,
            avatar_url: this.data.userInfo.avatar_url
        });
    },
    save() {
        this.validate(() => {
            const { nick_name, signature, userInfo, avatar_url } = this.data;
            if (
                nick_name === userInfo.nick_name &&
                signature === userInfo.signature &&
                avatar_url === userInfo.avatar_url
            ) {
                return;
            }

            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '保存中…'
            });

            this.setData({
                submiting: true
            });

            utils
                .request({
                    url: '/user/profile',
                    method: 'post',
                    data: {
                        nick_name,
                        signature,
                        avatar_url
                    }
                })
                .then(res => {
                    this.bridge.updateData({
                        userInfo: {
                            ...userInfo,
                            nick_name,
                            signature,
                            avatar_url
                        }
                    });

                    this.setData({
                        submiting: false
                    });

                    $toast.clear();

                    $toast.success({
                        forbidClick: true,
                        message: '修改成功'
                    });

                    this.onChange();
                });
        });
    }
});
