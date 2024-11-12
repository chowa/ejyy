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
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        fetching: true,
        list: []
    },
    onLoad() {
        this.loadData();
    },
    loadData() {
        utils
            .request({
                url: '/family/list',
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    list: res.data.list
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    }
});
