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
import { SUCCESS, USER_NOT_BINDING_PHONE } from '~/constant/code';
import { INTACT_USER_INFO } from '~/constant/status';
import utils from '~/utils';

interface RequestBody {
    nick_name: string;
    signature: string;
    real_name: string;
    idcard: string;
    avatar_url: string;
}

const MpUserSupplementAction = <Action>{
    router: {
        path: '/user/supplement',
        method: 'post',
        authRequired: true
    },
    validator: {
        body: [
            {
                name: 'nick_name',
                required: true,
                max: 12
            },
            {
                name: 'signature',
                required: true,
                max: 36
            },
            {
                name: 'real_name',
                required: true,
                max: 8
            },
            {
                name: 'idcard',
                required: true,
                validator: val => utils.idcard.verify(val),
                message: '身份证号码验证失败'
            },
            {
                name: 'avatar_url',
                required: true,
                validator: val => /^\/avatar\/[a-z0-9]{32}|default\.(jpg|jpeg|png)$/.test(val)
            }
        ]
    },
    response: async ctx => {
        const { nick_name, signature, real_name, idcard, avatar_url } = <RequestBody>ctx.request.body;

        if (!ctx.mpUserInfo.phone) {
            return (ctx.body = {
                code: USER_NOT_BINDING_PHONE,
                message: '当前用户未绑定手机号码'
            });
        }

        const gender = utils.idcard.gender(idcard);

        await ctx.model
            .from('ejyy_wechat_mp_user')
            .where('id', ctx.mpUserInfo.id)
            .update({
                nick_name,
                signature,
                real_name,
                idcard: idcard.toUpperCase(),
                avatar_url,
                gender,
                intact: INTACT_USER_INFO
            });

        ctx.body = {
            code: SUCCESS,
            message: '个人资料补充成功',
            data: {
                gender
            }
        };
    }
};

export default MpUserSupplementAction;
