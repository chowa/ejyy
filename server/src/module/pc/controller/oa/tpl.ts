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
