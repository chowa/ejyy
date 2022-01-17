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
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

function isHaveLicense() {
    const pages = getCurrentPages();
    const curPage = pages[pages.length - 1];
    const { haveLicense } = curPage.data;

    return haveLicense;
}

CwPage({
    data: {
        ASSETS_HOST,
        stamp: Date.now(),
        // form data start
        pet_type: 1,
        name: '',
        sex: '',
        photo: '',
        coat_color: '',
        breed: '',
        haveLicense: false,
        pet_license: '',
        pet_license_award_at: '',
        vaccinated_at: '',
        vaccine_type: '',
        // form data end
        submiting: false,
        licenseCalendarVisible: false,
        accinateCalendarVisible: false
    },
    validator: {
        formFields: [
            'pet_type',
            'name',
            'sex',
            'photo',
            'coat_color',
            'breed',
            'pet_license',
            'pet_license_award_at',
            'vaccinated_at',
            'vaccine_type'
        ],
        formRule: {
            pet_type: [{ required: true, message: '请选择宠物类型' }],
            name: [
                { required: true, message: '请输入宠物名' },
                { max: 12, message: '宠物名不能超过12个字' }
            ],
            sex: [{ required: true, message: '请选择宠物雌雄' }],
            photo: [{ required: true, message: '请上传宠物照片' }],
            coat_color: [
                { required: true, message: '请输入宠物毛色' },
                { max: 10, message: '宠物毛色不能超过10个字' }
            ],
            breed: [
                { required: true, message: '请输入宠物品种' },
                { max: 20, message: '宠物品种不能超过20个字' }
            ],
            pet_license: [
                {
                    message: '请输入证书编号',
                    required: true,
                    validator: (rule, value) => (!isHaveLicense() ? true : value !== '')
                }
            ],
            pet_license_award_at: [
                {
                    message: '请选择发证日期',
                    required: true,
                    validator: (rule, value) => (!isHaveLicense() ? true : value !== '')
                }
            ],
            vaccinated_at: [
                {
                    message: '请选择最近一次疫苗接种日期',
                    required: true,
                    validator: (rule, value) => (!isHaveLicense() ? true : value !== '')
                }
            ],
            vaccine_type: [
                { required: true, message: '请输入疫苗类型' },
                { max: 32, message: '疫苗类型不能超过32个字' }
            ]
        }
    },
    updateHaveLicense(e) {
        this.setData({
            haveLicense: e.detail
        });
    },
    onSexChange(e) {
        this.setData({
            sex: e.detail
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
                pet_type,
                name,
                sex,
                photo,
                coat_color,
                breed,
                haveLicense,
                pet_license,
                pet_license_award_at,
                vaccinated_at,
                vaccine_type,
                communityInfo
            } = this.data;

            utils
                .request({
                    url: '/pet/create',
                    method: 'post',
                    data: {
                        pet_type,
                        name,
                        sex,
                        photo,
                        coat_color,
                        breed,
                        haveLicense,
                        pet_license,
                        pet_license_award_at,
                        vaccinated_at,
                        vaccine_type,
                        community_id: communityInfo.current.community_id
                    }
                })
                .then(
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $toast.clear();
                        wx.redirectTo({ url: `/pages/pet/detail?id=${res.data.id}` });
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
