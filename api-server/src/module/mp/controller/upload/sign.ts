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
import * as ossService from '~/service/oss';

const MpUploadSignAction = <Action>{
    router: {
        path: '/upload/sign',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                ...ossService.sign()
            }
        };
    }
};

export default MpUploadSignAction;
