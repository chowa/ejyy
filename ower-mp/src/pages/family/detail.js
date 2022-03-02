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
import $notify from '../../components/notify/notify';
import $dialog from '../../components/dialog/dialog';
import utils from '../../utils/index';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        userId: null,
        fetching: true,
        familyInfo: {},
        list: []
    },
    onLoad(opts) {
        this.setData(
            {
                userId: opts.id
            },
            () => {
                this.loadData();
            }
        );
    },
    loadData() {
        utils
            .request({
                url: `/family/detail/${this.data.userId}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    familyInfo: res.data.userInfo,
                    list: res.data.list
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    removeCommunity(e) {
        const { id } = e.currentTarget.dataset;
        const { list } = this.data;
        const user_building_ids = [];
        let index;

        list.every((item, key) => {
            if (item.community_id === id) {
                [].concat(item.houses, item.carports, item.warehouses).forEach(({ id }) => {
                    user_building_ids.push(id);
                });
                index = key;
                return false;
            }
            return true;
        });

        $dialog
            .confirm({
                title: '确认取消该用户的住宅授权吗？',
                message: '取消授权后如需恢复需要通过物业公司人工恢复'
            })
            .then(() => {
                utils
                    .request({
                        url: '/family/unbinding',
                        data: {
                            user_building_ids,
                            user_id: this.data.userId
                        },
                        method: 'post'
                    })
                    .then(
                        res => {
                            $notify({
                                type: 'success',
                                message: '取消用户住宅授权成功'
                            });

                            list.splice(index, 1);

                            this.setData({
                                list
                            });
                        },
                        res => {
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
