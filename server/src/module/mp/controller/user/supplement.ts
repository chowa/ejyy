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
                validator: val => utils.idcard.verify(val)
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
