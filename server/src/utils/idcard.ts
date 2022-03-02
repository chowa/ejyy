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

// 身份证号验证
export function verify(id: string): boolean {
    const arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; //加权因子
    const arrValid = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]; //校验码

    if (/^\d{17}\d|x$/i.test(id)) {
        let sum = 0;

        for (var i = 0; i < id.length - 1; i++) {
            sum += parseInt(id.charAt(i), 10) * arrExp[i];
        }

        const idx = sum % 11;
        return arrValid[idx] == id.substr(17, 1).toUpperCase();
    } else {
        return false;
    }
}

export function gender(id: string): 0 | 1 | 2 {
    if (!id) {
        return 0;
    }

    return parseInt(id.charAt(16), 10) % 2 === 0 ? 2 : 1;
}
