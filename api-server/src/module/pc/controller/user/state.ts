/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as uuid from 'uuid';
import config from '~/config';

const PcUserStateAction = <Action>{
    router: {
        path: '/user/state',
        method: 'get',
        authRequired: false
    },

    response: async ctx => {
        ctx.session.state = uuid.v4();

        ctx.body = {
            code: SUCCESS,
            data: {
                state: ctx.session.state,
                expire: config.session.maxAge
            }
        };
    }
};

export default PcUserStateAction;
