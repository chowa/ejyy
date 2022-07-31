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
