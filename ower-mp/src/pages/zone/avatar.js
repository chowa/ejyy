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
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    onLoad() {
        this.cropper = this.selectComponent('#cw-image-cropper');

        this.cropper.upload();
    },
    cropperload() {},
    loadimage(e) {
        this.cropper.imgReset();
    },
    clickcut(e) {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '保存中…'
        });

        utils.file.md5(e.detail.url).then(hash => {
            const fileName = `avatar/${hash}${utils.file.ext(e.detail.url)}`;

            utils.oss(fileName).then(sign => {
                wx.uploadFile({
                    url: sign.host,
                    filePath: e.detail.url,
                    name: 'file',
                    formData: sign,
                    success: () => {
                        const pages = getCurrentPages();
                        //获取所需页面
                        const prePage = pages[pages.length - 2];
                        prePage.setData({
                            avatar_url: `/${sign.key}`
                        });

                        $toast.clear();

                        wx.navigateBack({ delta: 1 });
                    },
                    fail: e => {
                        $toast.clear();
                        $notify({
                            type: 'danger',
                            message: '保存头像失败'
                        });
                    }
                });
            });
        });
    }
});
