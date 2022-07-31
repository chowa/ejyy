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

import SMD5 from '../libs/md5';

export function ext(filename) {
    const pos = filename.lastIndexOf('.');
    let suffix = '';

    if (pos != -1) {
        suffix = filename.substring(pos);
    }
    return suffix;
}

export function md5(filePath) {
    return new Promise(resolve => {
        wx.getFileSystemManager().readFile({
            filePath,
            success: res => {
                const spark = new SMD5.ArrayBuffer();
                spark.append(res.data);
                const hexHash = spark.end(false);

                resolve(hexHash);
            },
            fail: res => {
                console.log(res);
            }
        });
    });
}
