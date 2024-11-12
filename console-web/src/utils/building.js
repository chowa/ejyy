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

export function text(detail, type = true) {
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
