/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
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
