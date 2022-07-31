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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import * as common from '../common/common';

CwPage({
    data: {
        stamp: Date.now(),
        localActions: [],
        // form data start
        building_id: null,
        vistor_name: '',
        vistor_phone: '',
        car_number: '',
        expire: '',
        // form data end
        is_new_energy: false,
        submiting: false,
        calendarVisible: false,
        actionVisible: false,
        vistorLocal: ''
    },
    validator: {
        formFields: ['building_id', 'vistor_name', 'vistor_phone', 'expire'],
        formRule: {
            vistor_name: [
                { required: true, message: '请输入访客称呼' },
                { max: 8, message: '访客称呼不能超过8个字' }
            ],
            vistor_phone: [
                { required: true, message: '请输入访客手机号码' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号码' }
            ],
            building_id: [{ required: true, message: '请选择接到访地点' }],
            expire: [{ message: '请选择到访时间', required: true }]
        }
    },
    onGlobalDataUpdate() {
        const localActions = [];
        const { communityInfo } = this.data;

        []
            .concat(communityInfo.current.houses, communityInfo.current.carports, communityInfo.current.warehouses)
            .forEach(item => {
                localActions.push({
                    id: item.building_id,
                    name: common.building(item)
                });
            });

        this.setData({ localActions });
    },
    showCalendar() {
        this.setData({
            calendarVisible: true
        });
    },
    hideCalendar() {
        this.setData({
            calendarVisible: false
        });
    },
    onDateChange(e) {
        this.setData({
            expire: +e.detail,
            calendarVisible: false
        });
    },
    showAction() {
        this.setData({
            actionVisible: true
        });
    },
    hideAction() {
        this.setData({
            actionVisible: false
        });
    },
    onActionChange(e) {
        this.setData({
            building_id: e.detail.id,
            vistorLocal: e.detail.name
        });
    },
    chooseContact() {
        wx.chooseContact({
            success: res => {
                this.setData({
                    vistor_name: res.displayName,
                    vistor_phone: res.phoneNumber
                });
            },
            fail: () => {
                $notify({
                    type: 'danger',
                    message: '选择通讯录联系人失败'
                });
            }
        });
    },
    updateNewEnergy(e) {
        this.setData({
            is_new_energy: e.detail
        });
        this.selectComponent('#car-number').clear();
    },
    onCarNumberChange(e) {
        this.setData({
            car_number: e.detail
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
            const { building_id, vistor_name, vistor_phone, car_number, expire, communityInfo } = this.data;

            utils
                .request({
                    url: '/vistor/create',
                    method: 'post',
                    data: {
                        building_id,
                        vistor_name,
                        vistor_phone,
                        car_number: car_number ? car_number : undefined,
                        expire,
                        community_id: communityInfo.current.community_id
                    }
                })
                .then(
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $toast.clear();
                        wx.redirectTo({ url: `/pages/vistor/detail?id=${res.data.id}` });
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
