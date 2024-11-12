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
