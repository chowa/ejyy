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
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';

let timer = null;

CwPage({
    data: {
        loginCode: null
    },
    onShow() {
        if (!this.data.userInfo.phone && !timer) {
            this.getLoginCode();
        }
    },
    onHide() {
        this.clearGetLoginCode();
    },
    getLoginCode() {
        wx.login({
            success: ({ code }) => {
                this.setData({ loginCode: code });

                if (!this.data.userInfo.phone) {
                    timer = setTimeout(() => {
                        this.getLoginCode();
                    }, 4.5 * 60 * 10000);
                } else {
                    this.clearGetLoginCode();
                }
            }
        });
    },
    clearGetLoginCode() {
        clearTimeout(timer);
        timer = null;
    },
    bindPhone(e) {
        if (!e.detail.iv) {
            return $notify({
                type: 'danger',
                message: '请同意获取你的手机号码'
            });
        }

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

                    $toast.success({
                        message: '手机绑定成功'
                    });
                },
                () => {
                    $toast.clear();
                }
            );
    }
});
