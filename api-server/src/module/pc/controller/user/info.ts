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
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

const PcUserInfoAction = <Action>{
    router: {
        path: '/user/info',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        const postInfo = await propertyCompanyService.postInfo(ctx.model, ctx.pcUserInfo.id);
        const info = { ...ctx.pcUserInfo };

        info.phone = utils.phone.hide(info.phone);

        delete info.department_id;
        delete info.job_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                userInfo: info,
                postInfo
            }
        };
    }
};

export default PcUserInfoAction;
