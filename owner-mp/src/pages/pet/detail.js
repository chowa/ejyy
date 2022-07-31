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
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        id: null,
        fetching: true,
        detail: {},
        stamp: Date.now(),
        fillPetLicense: false,
        fillVaccinate: false,
        licenseSubmiting: false,
        vaccianteSubmiting: false,
        pet_license: '',
        pet_license_award_at: '',
        licenseCalendarVisible: false,
        accinateCalendarVisible: false,
        vaccinated_at: '',
        vaccine_type: '',
        removeActionVisible: false,
        removeActions: [
            { name: '死亡', id: 1 },
            { name: '丢失', id: 2 },
            { name: '转赠', id: 3 },
            { name: '行政机关收缴', id: 4 }
        ]
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
                url: `/pet/detail/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    showPetLicense() {
        this.setData({
            fillPetLicense: true
        });
    },
    hidePetLicense() {
        this.setData({
            fillPetLicense: false
        });
    },
    showlicenseCalendar() {
        this.setData({
            licenseCalendarVisible: true
        });
    },
    hidelicenseCalendar() {
        this.setData({
            licenseCalendarVisible: false
        });
    },
    onLicenseDateChange(e) {
        this.setData({
            pet_license_award_at: +e.detail,
            licenseCalendarVisible: false
        });
    },
    showVaccinateCalendar() {
        this.setData({
            accinateCalendarVisible: true
        });
    },
    hideVaccinateCalendar() {
        this.setData({
            accinateCalendarVisible: false
        });
    },
    onVaccinateDateChange(e) {
        this.setData({
            vaccinated_at: +e.detail,
            accinateCalendarVisible: false
        });
    },
    updatePetLicense() {
        const { pet_license, pet_license_award_at, id, detail } = this.data;

        if (!pet_license) {
            return $toast({ message: '请输入证书编号' });
        }

        if (!pet_license_award_at) {
            return $toast({ message: '请选择发证时间' });
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        this.setData({ licenseSubmiting: true });

        utils
            .request({
                url: `/pet/license/${id}`,
                method: 'post',
                data: {
                    pet_license,
                    pet_license_award_at
                }
            })
            .then(
                () => {
                    $toast.clear();
                    this.setData({
                        detail: {
                            info: {
                                ...detail.info,
                                pet_license,
                                pet_license_award_at
                            },
                            vaccinates: detail.vaccinates
                        },
                        licenseSubmiting: false,
                        fillPetLicense: false
                    });
                    $notify({
                        type: 'success',
                        message: '添加登记信息成功'
                    });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                    this.setData({
                        licenseSubmiting: false
                    });
                }
            );
    },
    showVaccinate() {
        this.setData({
            fillVaccinate: true
        });
    },
    hideVaccinate() {
        this.setData({
            fillVaccinate: false
        });
    },
    updateVaccinate() {
        const { vaccinated_at, vaccine_type, id, detail } = this.data;

        if (!vaccinated_at) {
            return $toast({ message: '请选择最近一次疫苗接种时间' });
        }

        if (!vaccine_type) {
            return $toast({ message: '请输入最近一次接种疫苗类型' });
        }

        if (vaccine_type.length > 32) {
            return $toast({ message: '接种疫苗类型不能超过32个字' });
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        this.setData({ vaccianteSubmiting: true });

        utils
            .request({
                url: `/pet/vaccinate/${id}`,
                method: 'post',
                data: {
                    vaccinated_at,
                    vaccine_type
                }
            })
            .then(
                () => {
                    $toast.clear();
                    this.setData({
                        detail: {
                            info: detail.info,
                            vaccinates: [{ vaccinated_at, vaccine_type }].concat(detail.vaccinates)
                        },
                        vaccianteSubmiting: false,
                        fillVaccinate: false,
                        vaccinated_at: '',
                        vaccine_type: ''
                    });
                    $notify({
                        type: 'success',
                        message: '添加登记信息成功'
                    });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                    this.setData({
                        vaccianteSubmiting: false
                    });
                }
            );
    },
    showRemoveAction() {
        this.setData({ removeActionVisible: true });
    },
    hideRemoveAction() {
        this.setData({ removeActionVisible: false });
    },
    onRemoveReasonChange(e) {
        console.log(e);

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '注销中…'
        });

        utils
            .request({
                url: `/pet/remove/${this.data.id}`,
                method: 'post',
                data: {
                    reason: e.detail.id
                }
            })
            .then(
                () => {
                    $toast.clear();
                    $notify({
                        type: 'success',
                        message: '注销宠物成功'
                    });

                    setTimeout(() => {
                        wx.switchTab({
                            url: '/pages/home/index'
                        });
                    }, 2000);
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                }
            );
    }
});
