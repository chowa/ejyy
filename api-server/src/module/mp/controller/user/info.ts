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
