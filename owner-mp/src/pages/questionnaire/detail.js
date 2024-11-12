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
        id: null,
        fetching: true,
        questions: [],
        title: null,
        expire: null,
        statistics: {}
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
                url: `/questionnaire/detail/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                wx.setNavigationBarTitle({ title: res.data.title });

                this.setData({
                    fetching: false,
                    ...res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    }
});
