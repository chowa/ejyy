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
import $dialog from '../../components/dialog/dialog';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';

CwPage({
    data: {
        // form data start
        subject: '',
        content: '',
        // form data end
        submiting: false
    },
    validator: {
        formFields: ['subject', 'content'],
        formRule: {
            subject: [
                { required: true, message: '请输入问题主旨' },
                { max: 20, message: '问题主旨不能超过20个字' },
                { min: 2, message: '问题主旨应大于2个字' }
            ],
            content: [
                { required: true, message: '请输入问题描述' },
                { max: 200, message: '问题描述不能超过200个字' },
                { min: 5, message: '问题描述应大于5个字' }
            ]
        }
    },
    onChange() {
        const { subject, content } = this.data;

        this.setData({
            disabled: subject.length < 2 || content.length < 5 ? true : false
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

            const { subject, content } = this.data;

            utils
                .request({
                    url: '/feedback/problem',
                    method: 'post',
                    data: {
                        subject,
                        content
                    }
                })
                .then(
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $toast.clear();

                        $dialog
                            .alert({
                                forbidClick: true,
                                title: '提交成功',
                                message: '感谢您对「e家宜业」的支持'
                            })
                            .then(() => {
                                wx.navigateBack({ delta: 1 });
                            });
                    },
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $toast.clear();
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                    }
                );
        });
    }
});
