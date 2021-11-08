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
import * as ROLE from '~/constant/role_access';
import {
    OA_NOTICE_COMMUNITY_USER_STOP_WATER,
    OA_NOTICE_COMMUNITY_USER_STOP_WATER_TPL,
    OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY,
    OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY_TPL
} from '~/constant/tpl';

const PcNoticeTplAction = <Action>{
    router: {
        path: '/notice/tpl',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                list: [
                    {
                        title: '停水通知',
                        tpl: OA_NOTICE_COMMUNITY_USER_STOP_WATER,
                        content: OA_NOTICE_COMMUNITY_USER_STOP_WATER_TPL
                    },
                    {
                        title: '停电通知',
                        tpl: OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY,
                        content: OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY_TPL
                    }
                ]
            }
        };
    }
};

export default PcNoticeTplAction;
