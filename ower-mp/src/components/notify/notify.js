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

import { WHITE } from '../common/color';
const defaultOptions = {
    selector: '#cw-notify',
    type: 'danger',
    message: '',
    background: '',
    duration: 3000,
    zIndex: 110,
    top: 0,
    color: WHITE,
    customNavBar: false,
    onClick: () => {},
    onOpened: () => {},
    onClose: () => {}
};
function parseOptions(message) {
    if (message == null) {
        return {};
    }
    return typeof message === 'string' ? { message } : message;
}
function getContext() {
    const pages = getCurrentPages();
    return pages[pages.length - 1];
}
export default function Notify(options) {
    options = Object.assign(Object.assign({}, defaultOptions), parseOptions(options));
    const context = options.context || getContext();
    const notify = context.selectComponent(options.selector);
    delete options.context;
    delete options.selector;
    if (notify) {
        notify.setData(options);
        notify.show();
        return notify;
    }
    console.warn('未找到 cw-notify 节点，请确认 selector 及 context 是否正确');
}
Notify.clear = function(options) {
    options = Object.assign(Object.assign({}, defaultOptions), parseOptions(options));
    const context = options.context || getContext();
    const notify = context.selectComponent(options.selector);
    if (notify) {
        notify.hide();
    }
};
