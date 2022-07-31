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

import * as utils from './';

export function parse(file) {
    return new Promise((resolve, reject) => {
        utils.file.parse(file).then(params => {
            const fr = new FileReader();

            fr.onload = () => {
                const src = fr.result;
                const img = new Image();

                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height,
                        base64: src,
                        instance: img,
                        ...params
                    });
                };

                img.src = src;
            };

            fr.onerror = () => {
                reject();
            };

            fr.readAsDataURL(file);
        });
    });
}
