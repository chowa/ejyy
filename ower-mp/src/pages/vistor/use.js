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
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';
import QRCode from '../../libs/qrcode';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        stamp: Date.now(),
        navBarClass: 'nav-bar',
        fetching: true,
        detail: {},
        loading: false
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
        // opts.id = 2;

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
        $toast.loading({
            duration: 0,
            message: '二维码生成中',
            forbidClick: true
        });

        utils
            .request({
                url: `/vistor/use/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                new QRCode('canvas', {
                    text: res.data.uid,
                    width: 260,
                    height: 260,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                $toast.clear();
            });
    },
    pageBack() {
        wx.navigateBack({ delta: 1 });
    }
});
