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
        id: null,
        fetching: true,
        detail: {},
        steps: [{ text: '业主申请' }, { text: '物业许可' }, { text: '装修完工' }, { text: '物业验收' }],
        finishSubmiting: false,
        // form data start
        return_name: '',
        return_bank: '',
        return_bank_id: '',
        // form data end,
        returnSubmiting: false
    },
    validator: {
        formFields: ['return_name', 'return_bank', 'return_bank_id'],
        formRule: {
            return_name: [{ required: true, message: '请输入户名', max: 12 }],
            return_bank: [{ required: true, message: '请输入银行', max: 20 }],
            return_bank_id: [{ required: true, message: '请输入账号', max: 30 }]
        }
    },
    onLoad(opts) {
        // opts.id = 1;

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
        utils
            .request({
                url: `/fitment/detail/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data,
                    return_name: res.data.return_name,
                    return_bank: res.data.return_bank,
                    return_bank_id: res.data.return_bank_id
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    finishSubmit() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        this.setData({
            finishSubmiting: true
        });

        utils
            .request({
                url: `/fitment/finish/${this.data.id}`,
                method: 'get'
            })
            .then(
                res => {
                    this.setData({
                        finishSubmiting: false,
                        detail: {
                            ...this.data.detail,
                            step: 3,
                            finished_at: res.data.stamp
                        }
                    });

                    $notify({
                        type: 'success',
                        message: res.message
                    });
                    $toast.clear();
                },
                res => {
                    this.setData({
                        finishSubmiting: false
                    });
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                }
            );
    },
    updateReturn() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                returnSubmiting: true
            });

            const { return_name, return_bank, return_bank_id } = this.data;
            utils
                .request({
                    url: `/fitment/return_info/${this.data.id}`,
                    method: 'post',
                    data: { return_name, return_bank, return_bank_id }
                })
                .then(
                    res => {
                        this.setData({
                            returnSubmiting: false,
                            detail: {
                                ...this.data.detail,
                                return_name,
                                return_bank,
                                return_bank_id
                            }
                        });

                        $notify({
                            type: 'success',
                            message: res.message
                        });
                        $toast.clear();
                    },
                    res => {
                        this.setData({
                            returnSubmiting: false
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
