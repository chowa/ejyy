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
import { MP_REPAIR_ALLOT_TPL, MP_REPAIR_CONFIRM_TPL, MP_REPAIR_FINISH_TPL } from '~/constant/tpl';

const MpRepairTplAction = <Action>{
    router: {
        path: '/repair/tpl',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                dispose_subscribed: MP_REPAIR_ALLOT_TPL,
                confrim_subscribed: MP_REPAIR_CONFIRM_TPL,
                finish_subscribed: MP_REPAIR_FINISH_TPL
            }
        };
    }
};

export default MpRepairTplAction;
