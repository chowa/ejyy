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
import location from './location';

function isReturn() {
    const pages = getCurrentPages();
    const curPage = pages[pages.length - 1];
    const { return_hometown } = curPage.data;

    return return_hometown;
}

CwPage({
    data: {
        submiting: false,
        buildingActions: [],
        tourActions: [
            { id: 1, name: '绿色' },
            { id: 2, name: '黄色' },
            { id: 3, name: '红色' }
        ],
        real_name: '',
        tour_label: '绿色',
        community_name: '',
        building_label: '',
        // form start
        wechat_mp_user_id: null,
        building_id: undefined,
        temperature: '',
        tour_code: 1,
        return_hometown: 0,
        return_from_province: '',
        return_from_city: '',
        return_from_district: '',
        // formEnd
        buildingActionVisible: false,
        tourActionVisible: false,
        // 地址选择
        pickerVisible: false,
        columns: [
            {
                values: Object.keys(location)
            },
            {
                values: Object.keys(location['北京市'])
            },
            {
                values: location['北京市']['北京市']
            }
        ]
    },
    validator: {
        formFields: ['building_id', 'temperature', 'tour_code', 'return_hometown', 'return_from_district'],
        formRule: {
            building_id: [{ required: true, message: '请选择业主住所' }],
            temperature: [
                { required: true, message: '请输入业主当前体温' },
                { max: 6, message: '体温数据不能超过6个字' }
            ],
            tour_code: [{ required: true, message: '请选择行程码颜色' }],
            return_hometown: [{ required: true, message: '请选择是否外地返回' }],
            return_from_district: [
                { validator: (rule, value) => (!isReturn() ? true : value !== ''), message: '请选择返回地' }
            ]
        }
    },
    onLoad() {
        const res = wx.getStorageSync('OWER_INFO');

        if (!res) {
            return wx.navigateTo({
                url: '/pages/home/index'
            });
        }

        try {
            const cardInfo = JSON.parse(res);
            const buildings = [].concat(
                cardInfo.houses,
                cardInfo.merchants,
                cardInfo.carports,
                cardInfo.garages,
                cardInfo.warehouses
            );
            this.setData({
                wechat_mp_user_id: cardInfo.id,
                real_name: cardInfo.real_name,
                buildingActions: buildings.map(item => {
                    return {
                        id: item.building_id,
                        name: common.building(item)
                    };
                }),
                building_id: buildings[0].building_id,
                building_label: common.building(buildings[0])
            });
        } catch (e) {
            wx.navigateTo({
                url: '/pages/home/index'
            });
        }
    },
    onGlobalDataUpdate() {
        const index = this.data.postInfo.community_list.findIndex(
            item => item.community_id === this.data.postInfo.default_community_id
        );

        this.setData({
            community_name: this.data.postInfo.community_list[index].name
        });
    },
    showBuildingAction() {
        this.setData({ buildingActionVisible: true });
    },
    hideBuildingAction() {
        this.setData({ buildingActionVisible: false });
    },
    onBuildingChange(e) {
        this.setData({
            building_id: e.detail.id,
            building_label: e.detail.name
        });
    },
    showTourAction() {
        this.setData({ tourActionVisible: true });
    },
    hideTourAction() {
        this.setData({ tourActionVisible: false });
    },
    onTourChange(e) {
        this.setData({
            tour_code: e.detail.id,
            tour_label: e.detail.name
        });
    },
    onReturnChange(e) {
        this.setData({
            return_hometown: e.detail
        });
    },
    onLocationChange(e) {
        const { picker, value, index } = e.detail;
        const [province, city, district] = value;

        picker.setColumnValues(1, Object.keys(location[province]));

        if (!location[province][city]) {
            picker.setColumnValues(2, location[province][Object.keys(location[province])[0]]);
        } else if (!location[province][city].includes(district)) {
            picker.setColumnValues(2, location[province][city]);
        }
    },
    confirmLocation(e) {
        const { value } = e.detail;
        const [return_from_province, return_from_city, return_from_district] = value;

        this.setData({
            return_from_province,
            return_from_city,
            return_from_district,
            pickerVisible: false
        });
    },
    showPicker() {
        this.setData({ pickerVisible: true });
    },
    cancelLocation() {
        this.setData({ pickerVisible: false });
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
            const {
                wechat_mp_user_id,
                building_id,
                temperature,
                tour_code,
                return_hometown,
                return_from_province,
                return_from_city,
                return_from_district,
                postInfo
            } = this.data;

            utils
                .request({
                    url: '/epidemic/create',
                    data: {
                        wechat_mp_user_id,
                        community_id: postInfo.default_community_id,
                        building_id,
                        temperature,
                        tour_code,
                        return_hometown,
                        return_from_province,
                        return_from_city,
                        return_from_district
                    },
                    method: 'post'
                })
                .then(
                    res => {
                        this.setData({ submiting: false });
                        $toast.clear();
                        $notify({
                            type: 'success',
                            message: '登记成功'
                        });

                        setTimeout(() => {
                            setTimeout(() => {
                                wx.redirectTo({ url: '/pages/home/index' });
                            }, 2000);
                        }, 2000);
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
        });
    }
});
