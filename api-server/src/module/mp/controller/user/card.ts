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

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import utils from '~/utils';

const MpUserCardAction = <Action>{
    router: {
        path: '/user/card',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },

    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                uid: utils.crypto.encrypt(`${ctx.mpUserInfo.id}-${Date.now()}`)
            }
        };
    }
};

export default MpUserCardAction;
