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

interface RequestBody {
    nick_name: string;
    signature: string;
    avatar_url: string;
}

const MpUserProfileAction = <Action>{
    router: {
        path: '/user/profile',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
                name: 'avatar_url',
                required: true,
                validator: val => /^\/avatar\/[a-z0-9]{32}|default\.(jpg|jpeg|png)$/.test(val)
            }
        ]
    },
    response: async ctx => {
        const { nick_name, signature, avatar_url } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_wechat_mp_user')
            .where('id', ctx.mpUserInfo.id)
            .update({ nick_name, signature, avatar_url });

        ctx.body = {
            code: SUCCESS,
            message: '个人资料更新成功'
        };
    }
};

export default MpUserProfileAction;
