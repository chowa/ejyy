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

CwPage({
    data: {
        list: [],
        fetching: true
    },
    onGlobalDataUpdate() {
        this.fetchingList();
    },
    fetchingList() {
        utils
            .request({
                url: '/car/list',
                method: 'post',
                data: {
                    community_id: this.data.communityInfo.current.community_id
                }
            })
            .then(res => {
                this.setData({
                    list: res.data.list,
                    fetching: false
                });

                wx.stopPullDownRefresh();
            });
    },
    bindingCar(e) {
        const { id } = e.currentTarget.dataset;

        wx.navigateTo({ url: `/pages/car/binding?id=${id}` });
    },
    unbindingCar(e) {
        const { id, index, carIndex, communityIndex } = e.currentTarget.dataset;

        $dialog
            .confirm({
                title: '确认要解绑车辆吗？',
                message: '车辆解除绑定后，仅能通过物业公司对该车辆信息恢复'
            })
            .then(res => {
                utils
                    .request({
                        url: `/car/unbinding/${id}`,
                        method: 'get'
                    })
                    .then(
                        res => {
                            const { list } = this.data;

                            list[index].cars.splice(carIndex, 1);

                            this.setData({ list });

                            $notify({
                                type: 'success',
                                message: '解绑成功'
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
    },
    onPullDownRefresh() {
        this.fetchingList();
    }
});
