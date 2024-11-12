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
import $dialog from '../../components/dialog/dialog';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';

CwPage({
    data: {
        // form data start
        community_name: '',
        house: '',
        carport: '',
        warehouse: '',
        // form data end
        submiting: false
    },
    validator: {
        formFields: ['community_name', 'house', 'carport', 'warehouse'],
        formRule: {
            community_name: [
                { required: true, message: '请输入小区名称' },
                { max: 56, message: '小区名称不能超过56个字' },
                { min: 2, message: '小区名称应大于2个字' }
            ],
            house: [{ max: 56, message: '住宅信息不能超过56个字' }],
            carport: [{ max: 56, message: '车位信息不能超过56个字' }],
            warehouse: [{ max: 56, message: '仓库信息不能超过56个字' }]
        }
    },
    // onLoad() {
    //     wx.getLocation({
    //         success: (res) => {
    //             console.log(res)
    //         }
    //     })
    // },
    save() {
        this.validate(() => {
            const { community_name, house, carport, warehouse } = this.data;

            if (!house && !carport && !warehouse) {
                return $toast({ message: '住宅、车位、仓房信息必须填写一个' });
            }

            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            const send = data => {
                utils
                    .request({
                        url: '/apply/create',
                        method: 'post',
                        data: {
                            community_name,
                            house,
                            carport,
                            warehouse,
                            ...data
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
                                    message: res.data.community_id
                                        ? '您的认证申请已提交，请等待物业公司审核'
                                        : '系统中未查询到该小区，您的申请会被搁置'
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
            };

            wx.getSetting({
                withSubscriptions: true,
                success: res => {
                    utils
                        .request({
                            url: '/apply/tpl',
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
