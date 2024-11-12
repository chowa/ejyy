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

CwPage({
    data: {
        fetching: true,
        car_number: null,
        list: []
    },
    onLoad(opt) {
        this.setData({
            car_number: opt.car_number
        });
    },
    onGlobalDataUpdate() {
        this.getDetail();
    },
    getDetail() {
        if (!this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({
            fetching: true
        });

        return utils
            .request({
                url: '/move_car/find',
                method: 'post',
                data: {
                    car_number: this.data.car_number,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    list: res.data.list
                });
            });
    },
    makeCell(e) {
        const { phone } = e.currentTarget.dataset;

        wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {}
        });
    }
});
