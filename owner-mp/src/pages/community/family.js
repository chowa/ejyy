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
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';
import QRCode from '../../libs/qrcode';

let timer = null;

CwPage({
    data: {
        navBarClass: 'nav-bar',
        community_id: null,
        expired: false,
        communityName: '',
        building_ids: []
    },
    onGlobalDataUpdate() {
        let communityName = '';
        const building_ids = [];

        this.data.communityInfo.list.forEach(community => {
            if (community.community_id === this.data.community_id) {
                communityName = community.name;

                [].concat(community.houses, community.carports, community.warehouses).forEach(({ building_id }) => {
                    building_ids.push(building_id);
                });
            }
        });

        this.setData(
            {
                communityName,
                building_ids
            },
            () => {
                this.drawCode();
            }
        );
    },
    onHide() {
        clearInterval(timer);
    },
    onPageScroll(e) {
        const { scrollTop } = e;
        const navBarClass = ['nav-bar'];

        if (scrollTop > 0 && scrollTop < 270) {
            navBarClass.push('half-opacity');
        } else if (scrollTop >= 270) {
            navBarClass.push('full-opacity');
        }

        this.setData({ navBarClass: navBarClass.join(' ') });
    },
    onLoad(opts) {
        this.setData({
            community_id: parseInt(opts.id, 10) || 1
        });
    },
    drawCode() {
        $toast.loading({
            duration: 0,
            message: '二维码生成中',
            forbidClick: true
        });

        clearInterval(timer);

        utils
            .request({
                url: '/community/family_code',
                method: 'post',
                data: {
                    building_ids: this.data.building_ids
                }
            })
            .then(res => {
                const { text, stamp } = res.data;

                new QRCode('canvas', {
                    text,
                    width: 260,
                    height: 260,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                timer = setInterval(() => {
                    if (Date.now() >= res.data.expire + stamp) {
                        this.setData({ expired: true });
                        clearInterval(timer);
                    }
                }, 1000);

                $toast.clear();
            });
    },
    refresh() {
        this.setData({ expired: false });
        this.drawCode();
    },
    pageBack() {
        wx.navigateBack({ delta: 1 });
    }
});
