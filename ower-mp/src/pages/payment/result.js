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
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

let timer = null;

CwPage({
    data: {
        success: false,
        id: null
    },
    onHide() {
        if (timer !== null) {
            clearInterval(timer);
            wx.redirectTo({ url: `/pages/payment/detail?id=${id}` });
        }
    },
    onLoad(opts) {
        this.setData(
            {
                id: parseInt(opts.id, 10)
            },
            () => {
                timer = setInterval(() => {
                    this.getResult();
                }, 2000);
            }
        );
    },
    getResult() {
        const { id } = this.data;

        utils
            .request({
                url: `/payment/result/${id}`,
                method: 'get'
            })
            .then(res => {
                if (res.data.result) {
                    this.setData({ success: true });
                    timer = null;
                    clearInterval(timer);
                }
            });
    },
    goDetail() {
        const { id } = this.data;

        wx.redirectTo({ url: `/pages/payment/detail?id=${id}` });
    }
});
