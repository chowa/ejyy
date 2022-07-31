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
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';

CwPage({
    data: {
        car_number: '',
        is_new_energy: 0,
        submiting: false
    },
    validator: {
        formFields: ['car_number'],
        formRule: {
            car_number: [{ required: true, message: '请输入车牌号码' }]
        }
    },
    onCarEnergyChange(e) {
        const is_new_energy = e.target.dataset.name;

        this.setData({
            is_new_energy
        });

        this.selectComponent('#car-number').clear();
    },
    onCarNumberChange(e) {
        this.setData({
            car_number: e.detail
        });
    },
    submit() {
        this.validate(() => {
            const { car_number } = this.data;

            wx.navigateTo({ url: `/pages/move_car/concat?car_number=${car_number}` });
        });
    }
});
