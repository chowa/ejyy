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

import { getCurrentPage } from '../common/utils';
function onPageScroll(event) {
    const { cwPageScroller = [] } = getCurrentPage();
    cwPageScroller.forEach(scroller => {
        if (typeof scroller === 'function') {
            // @ts-ignore
            scroller(event);
        }
    });
}
export const pageScrollMixin = scroller =>
    Behavior({
        attached() {
            const page = getCurrentPage();
            if (Array.isArray(page.cwPageScroller)) {
                page.cwPageScroller.push(scroller.bind(this));
            } else {
                page.cwPageScroller =
                    typeof page.onPageScroll === 'function'
                        ? [page.onPageScroll.bind(page), scroller.bind(this)]
                        : [scroller.bind(this)];
            }
            page.onPageScroll = onPageScroll;
        },
        detached() {
            var _a;
            const page = getCurrentPage();
            page.cwPageScroller =
                ((_a = page.cwPageScroller) === null || _a === void 0
                    ? void 0
                    : _a.filter(item => item !== scroller)) || [];
        }
    });
