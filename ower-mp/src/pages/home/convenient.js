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

CwPage({
    data: {
        fetching: true,
        list: []
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    loadData() {
        utils
            .request({
                url: `/convenient/detail/${this.data.communityInfo.current.community_id}`,
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
    },
    makeCell(e) {
        const { phone } = e.currentTarget.dataset;

        wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {}
        });
    }
});
