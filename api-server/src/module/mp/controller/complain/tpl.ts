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
import { MP_COMPLAIN_ALLOT_TPL, MP_COMPLAIN_CONFRIM_TPL, MP_COMPLAIN_FINISH_TPL } from '~/constant/tpl';

const MpComplainTplAction = <Action>{
    router: {
        path: '/complain/tpl',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                dispose_subscribed: MP_COMPLAIN_ALLOT_TPL,
                confrim_subscribed: MP_COMPLAIN_CONFRIM_TPL,
                finish_subscribed: MP_COMPLAIN_FINISH_TPL
            }
        };
    }
};

export default MpComplainTplAction;
