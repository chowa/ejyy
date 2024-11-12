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
import * as wechatService from '~/service/wechat';
import { SUCCESS } from '~/constant/code';

const PcOaTplAction = <Action>{
    router: {
        path: '/oa/tpl',
        method: 'get',
        authRequired: true,
        roles: []
    },
    response: async ctx => {
        const { template_list: list } = await wechatService.getOaTplList();

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcOaTplAction;
