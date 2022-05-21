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
import * as uuid from 'uuid';
import * as ROLE from '~/constant/role_access';
import config from '~/config';

const PcHrStateAction = <Action>{
    router: {
        path: '/hr/state',
        method: 'get',
        authRequired: true,
        roles: [ROLE.RLZY]
    },

    response: async ctx => {
        ctx.session.hrState = uuid.v4();

        ctx.body = {
            code: SUCCESS,
            data: {
                state: ctx.session.hrState,
                expire: config.session.maxAge
            }
        };
    }
};

export default PcHrStateAction;
