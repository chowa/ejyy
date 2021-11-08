/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import $dialog from '../../components/dialog/dialog';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import request from '../../utils/request';
import utils from '../../utils/index';
import location from './location';

CwPage({
    data: {
        // form data start
        company_name: '',
        contact_person: '',
        community_name: '',
        household_amount: '',
        province: '',
        city: '',
        district: '',
        // form data end
        submiting: false,
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
        formFields: ['company_name', 'contact_person', 'community_name', 'household_amount', 'district'],
        formRule: {
            company_name: [
                { required: true, message: '请输入公司名称' },
                { max: 20, message: '公司名称不能超过20个字' },
                { min: 6, message: '公司名称应大于6个字' }
            ],
            contact_person: [
                { required: true, message: '请输入您的称呼' },
                { max: 5, message: '称呼不能超过5个字' },
                { min: 2, message: '称呼应大于2个字' }
            ],
            community_name: [
                { required: true, message: '请输入小区名称' },
                { max: 12, message: '小区名称不能超过12个字' },
                { min: 3, message: '小区名称应大于3个字' }
            ],
            household_amount: [{ required: true, message: '请输入小区户数' }],
            district: [{ required: true, message: '请选择小区地址' }]
        }
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
        const [province, city, district] = value;

        this.setData({
            province,
            city,
            district,
            pickerVisible: false
        });
    },
    showPicker() {
        this.setData({
            pickerVisible: true
        });
    },
    cancelLocation() {
        this.setData({
            pickerVisible: false
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

            const {
                company_name,
                contact_person,
                community_name,
                household_amount,
                province,
                city,
                district
            } = this.data;

            utils
                .request({
                    url: '/feedback/join',
                    method: 'post',
                    data: {
                        company_name,
                        contact_person,
                        community_name,
                        household_amount,
                        province,
                        city,
                        district
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
                                title: '申请成功',
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
