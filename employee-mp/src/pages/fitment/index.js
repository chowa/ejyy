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
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import $dialog from '../../components/dialog/dialog';
import * as common from '../common/common';

CwPage({
    data: {
        fetching: true,
        page_size: 5,
        page_num: 1,
        page_amount: 1,
        list: []
    },
    onLoad() {
        this.setData({
            page_size: Math.ceil(this.data.systemInfo.windowHeight / 140)
        });
    },
    onGlobalDataUpdate() {
        this.loadData(1);
    },
    loadData(page_num) {
        if ((this.data.fetching && page_num > 1) || !this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({
            fetching: true,
            list: page_num === 1 ? [] : this.data.list
        });

        return utils
            .request({
                url: '/fitment/list',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id,
                    step: 3
                }
            })
            .then(
                res => {
                    this.setData({
                        fetching: false,
                        page_num: res.data.page_num,
                        page_amount: res.data.page_amount,
                        list: page_num === 1 ? res.data.list : [].concat(this.data.list, res.data.list)
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
    // 下拉刷新
    onReachBottom() {
        const { page_num, page_amount } = this.data;

        if (page_num < page_amount) {
            this.loadData(page_num + 1);
        }
    },
    onPullDownRefresh() {
        this.loadData(1).then(() => {
            wx.stopPullDownRefresh();
        });
    },
    finish(e) {
        const { id } = e.currentTarget.dataset;
        const { list } = this.data;
        const index = list.findIndex(item => item.id === id);

        $dialog
            .confirm({
                message: `确认「${common.building(list[index])}」符合验收条件吗`
            })
            .then(() => {
                $toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: '提交中…'
                });

                utils
                    .request({
                        url: `/fitment/confirm`,
                        method: 'post',
                        data: {
                            id,
                            community_id: this.data.postInfo.default_community_id
                        }
                    })
                    .then(
                        res => {
                            $toast.clear();
                            $notify({
                                type: 'success',
                                message: '验收成功'
                            });

                            list[index].step = 4;

                            this.setData({ list });
                        },
                        res => {
                            $toast.clear();
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                        }
                    );
            })
            .catch(() => {});
    }
});
