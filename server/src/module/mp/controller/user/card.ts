/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import config from '~/config';
import crypto from 'crypto';

const MpUserCardAction = <Action>{
    router: {
        path: '/user/card',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },

    response: async ctx => {
        const cipher = crypto.createCipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
        let crypted = cipher.update(`${ctx.mpUserInfo.id}-${Date.now()}`, 'utf8', 'hex');

        crypted += cipher.final('hex');

        ctx.body = {
            code: SUCCESS,
            data: {
                uid: crypted
            }
        };
    }
};

export default MpUserCardAction;
