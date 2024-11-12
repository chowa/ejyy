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
import communityService from '~/service/community';
import utils from '~/utils';

const MpUserInfoAction = <Action>{
    router: {
        path: '/user/info',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        const communityInfo = await communityService(ctx.model, ctx.mpUserInfo.id);
        const info = { ...ctx.mpUserInfo };

        delete info.real_name;
        delete info.idcard;

        info.phone = utils.phone.hide(info.phone);

        ctx.body = {
            code: SUCCESS,
            data: {
                userInfo: info,
                communityInfo
            }
        };
    }
};

export default MpUserInfoAction;
