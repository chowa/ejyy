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

export function double(num) {
    return num < 10 ? '0' + num : num;
}

export function date(stamp, time = true) {
    const d = new Date(stamp);

    return (
        d.getFullYear() +
        '年' +
        double(d.getMonth() + 1) +
        '月' +
        double(d.getDate()) +
        '日' +
        (time ? ' ' + double(d.getHours()) + ':' + double(d.getMinutes()) + ':' + double(d.getSeconds()) : '')
    );
}

export function building(detail, type = true) {
    let typeName = '';

    switch (detail.type) {
        case 1:
            typeName = '住宅';
            break;

        case 2:
            typeName = '车位';
            break;

        case 3:
            typeName = '仓房';
            break;

        case 4:
            typeName = '商户';
            break;

        case 5:
            typeName = '车库';
            break;
    }

    return (
        (detail.area ? detail.area : '') +
        ' ' +
        (detail.building ? detail.building : '') +
        (detail.unit ? detail.unit : '') +
        detail.number +
        (type ? '（' + typeName + '）' : '')
    );
}

export function time(stamp) {
    const d = new Date(stamp);

    return double(d.getHours()) + ':' + double(d.getMinutes()) + ':' + double(d.getSeconds());
}
