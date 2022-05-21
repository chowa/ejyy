/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import $dialog from '../../components/dialog/dialog';
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';

CwPage({
    findCommunityInfoById(id) {
        const { list } = this.data.communityInfo;
        const index = list.findIndex(item => item.community_id === id);

        return list[index];
    },
    setDefaultCommunity(e) {
        const { id } = e.currentTarget.dataset;
        const info = this.findCommunityInfoById(id);
        const { current, list } = this.data.communityInfo;

        if (current.community_id === id) {
            return;
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '设置中…'
        });

        utils
            .request({
                url: '/community/default',
                method: 'post',
                data: {
                    community_id: id
                }
            })
            .then(res => {
                this.bridge.updateData({
                    communityInfo: {
                        list,
                        current: list[list.findIndex(({ community_id }) => community_id === id)]
                    }
                });

                $toast.clear();
            });
    },
    removeCommunity(e) {
        const { id } = e.currentTarget.dataset;
        const info = this.findCommunityInfoById(id);

        $dialog
            .confirm({
                title: '请确认',
                message: `确认要删除${info.name}小区的全部信息吗？删除后不可恢复！`
            })
            .then(() => {
                $toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: '删除中…'
                });

                const user_building_ids = [];

                [].concat(info.houses, info.carports, info.warehouses).forEach(({ user_building_id }) => {
                    user_building_ids.push(user_building_id);
                });

                utils
                    .request({
                        url: '/community/remove',
                        method: 'post',
                        data: {
                            user_building_ids,
                            community_id: info.community_id
                        }
                    })
                    .then(res => {
                        this.bridge.updateData({
                            communityInfo: res.data.communityInfo
                        });

                        if (res.data.communityInfo.list.length === 0) {
                            wx.navigateTo({ url: '/pages/community/binding' });
                        }

                        $toast.clear();
                    });
            })
            .catch(() => {});
    },
    addCommunity() {
        wx.navigateTo({
            url: '/pages/community/binding'
        });
    },
    familyRelation(e) {
        const { id } = e.currentTarget.dataset;

        wx.navigateTo({
            url: `/pages/community/family?id=${id}`
        });
    }
});
