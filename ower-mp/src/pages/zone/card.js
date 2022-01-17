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
import { ASSETS_HOST } from '../../config';
import QRCode from '../../libs/qrcode';
import $toast from '../../components/toast/toast';

CwPage({
    data: {
        ASSETS_HOST
    },
    onLoad() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '生成中…'
        });

        utils
            .request({
                url: '/user/card',
                method: 'get'
            })
            .then(
                res => {
                    $toast.clear();

                    new QRCode('canvas', {
                        text: res.data.uid,
                        width: 260,
                        height: 260,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                },
                () => {
                    $toast.clear();
                }
            );
    },
    toTongxin() {
        wx.navigateToMiniProgram({
            appId: 'wx8f446acf8c4a85f5'
        });
    }
});
