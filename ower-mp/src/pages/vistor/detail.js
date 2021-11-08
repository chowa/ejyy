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
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';
import QRCode from '../../libs/qrcode';
import * as common from '../common/common';

CwPage({
    data: {
        fetching: true,
        detail: {},
        stamp: Date.now(),
        loading: false
    },
    onLoad(opts) {
        // opts.id = 1;

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
        utils
            .request({
                url: `/vistor/detail/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                if (res.data.used_at || res.data.expire < Date.now()) {
                    return;
                }

                $toast.loading({
                    message: '访客码生成中',
                    forbidClick: true
                });

                this.qrcode = new QRCode('canvas', {
                    text: res.data.uid,
                    title: `${res.data.community_name}小区${common.building(res.data, false)}访客码`,
                    description: `${common.date(res.data.expire)}前有效`,
                    copyright: true,
                    width: 260,
                    height: 260,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    share() {
        this.setData({ loading: true });
        this.qrcode.exportImage().then(
            path => {
                wx.showShareImageMenu({
                    path,
                    success: () => {
                        this.setData({ loading: false });
                    },
                    fail: () => {
                        this.setData({ loading: false });
                    }
                });
            },
            () => {
                $toast({ message: '保存访客码失败' });
            }
        );
    }
});
