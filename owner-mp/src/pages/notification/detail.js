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
import utils from '../../utils/index';

CwPage({
    data: {
        navBarClass: 'nav-bar',
        fetching: true,
        detail: {
            readed: false
        },
        backHome: false
    },
    onLoad(opts) {
        const pages = getCurrentPages();

        this.setData({
            backHome: pages.length === 1
        });

        if (opts.unread && pages.length > 1) {
            const prePage = pages[pages.length - 2];

            if (prePage.route === 'pages/notification/index') {
                prePage.loadUnreadData(1);
                prePage.loadReadedData(1);
            }
        }

        utils
            .request({
                url: `/notice/read/${opts.id}?unread=${opts.unread}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });
            });
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
    onBackClick() {
        if (!this.data.backHome) {
            wx.navigateBack();
        } else {
            wx.switchTab({
                url: '/pages/home/index'
            });
        }
    }
});
