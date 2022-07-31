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
import request from '../../utils/request';
import QRCode from '../../libs/qrcode';
import { ASSETS_HOST } from '../../config';

function buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

CwPage({
    data: {
        uid: null,
        building_id: 0,
        nfcable: false,
        nfcopen: false,
        activeTab: 'nfc',
        ASSETS_HOST
    },
    onLoad(opts) {
        // debug
        // opts = {
        //     uid: '3dd7b526dd2f3ac63f515d23a815ce04',
        //     building_id: '18'
        // }

        this.setData({
            uid: opts.uid,
            building_id: parseInt(opts.building_id, 10)
        });
    },
    onShow() {
        this.startHCE();
    },
    onHide() {
        const { nfcable, nfcopen, systemInfo } = this.data;

        if (nfcable && nfcopen) {
            if (/android/i.test(systemInfo.system)) {
                wx.stopHCE();
            }

            wx.offHCEMessage(this.onHCEmessage);
        }
    },
    startHCE() {
        wx.startHCE({
            aid_list: ['FF20200520'],
            complete: ({ errCode }) => {
                // 当前设备不支持NFC
                if (errCode === 13000 || errCode === undefined) {
                    this.setData({
                        activeTab: 'qrcode'
                    });
                    wx.nextTick(() => {
                        this.drawCode();
                    });
                }
                // 当前设备支持NFC，但系统NFC开关未开启
                else if (errCode === 13001) {
                    this.setData({
                        nfcable: true,
                        nfcopen: false
                    });
                }

                if (errCode !== 0) {
                    return;
                }

                this.setData({
                    nfcable: true,
                    nfcopen: true
                });

                wx.onHCEMessage(this.onHCEmessage);
            }
        });
    },
    onHCEmessage(res) {
        if (res.messageType === 1) {
            const buffer = new ArrayBuffer(this.data.uid.length);
            const dataView = new DataView(buffer);
            for (let i = 0, len = str.length; i < len; i++) {
                let code = '' + str.charCodeAt(i);
                dataView.setUint8(i, code);
            }

            wx.sendHCEMessage({
                data: buffer,
                success: () => {
                    $toast.success({
                        message: '刷卡成功'
                    });
                }
            });
        }
    },
    changeTab(e) {
        const { systemInfo } = this.data;
        const { tab } = e.currentTarget.dataset;

        this.setData({
            activeTab: tab
        });

        if (tab === 'nfc') {
            this.startHCE();
        } else {
            if (/android/i.test(systemInfo.system)) {
                wx.stopHCE();
            }

            wx.offHCEMessage(this.onHCEmessage);
            wx.nextTick(() => {
                this.drawCode();
            });
        }
    },
    drawCode() {
        new QRCode('canvas', {
            text: `${this.data.uid}${Date.now().toString(16)}`,
            width: 150,
            height: 150,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    },
    pageBack() {
        wx.navigateBack({ delta: 1 });
    }
});
