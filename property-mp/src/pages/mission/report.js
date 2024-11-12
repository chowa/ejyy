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
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        fetching: true,
        id: null,
        list: []
    },
    onLoad(opt) {
        // opt.id = 2;

        this.setData({
            id: parseInt(opt.id, 10)
        });
    },
    onGlobalDataUpdate() {
        this.getDetail();
    },
    getDetail() {
        this.setData({
            fetching: true
        });

        return utils
            .request({
                url: `/mission/line/${this.data.id}`,
                method: 'get'
            })
            .then(
                res => {
                    this.setData({
                        fetching: false,
                        list: res.data.list
                    });
                },
                res => {
                    this.setData({
                        fetching: false,
                        list: []
                    });

                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onPullDownRefresh() {
        this.getDetail().then(() => {
            wx.stopPullDownRefresh();
        });
    },
    showImg(e) {
        const { id, index } = e.currentTarget.dataset;
        const key = this.data.list.findIndex(item => item.id === id);

        wx.previewImage({
            current: index,
            urls: this.data.list[key].imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    }
});
