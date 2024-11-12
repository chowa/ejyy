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
import { ROLES } from '../../constants/role';

CwPage({
    data: {
        fetching: true,
        id: null,
        detail: {},
        ROLES
    },
    onLoad(opt) {
        this.setData({
            id: parseInt(opt.id, 10)
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
                url: '/vistor/detail',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });
            });
    }
});
