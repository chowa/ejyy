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
        detail: {}
    },
    onLoad(opts) {
        utils
            .request({
                url: `/party/detail/${opts.id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });
            });
    }
});
