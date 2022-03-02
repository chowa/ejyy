/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WEHCAT_MP_LOGIN_ERROR } from '~/constant/code';
import { INCOMPLETE_USER_INFO } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import communityService from '~/service/community';
import utils from '~/utils';

interface RequestBody {
    code: string;
    brand?: string;
    model?: string;
    system?: string;
    platform?: string;
}

const MpUserLoginAction = <Action>{
    router: {
        path: '/user/login',
        method: 'post',
        authRequired: false
    },

    validator: {
        body: [
            {
                name: 'code',
                required: true,
                regex: /^[0-9a-zA-Z-_\$]{32}$/
            },
            {
                name: 'brand',
                required: true
            },
            {
                name: 'model',
                required: true
            },
            {
                name: 'system',
                required: true
            },
            {
                name: 'platform',
                required: true
            }
        ]
    },

    response: async ctx => {
        const { code, brand, model, system, platform } = <RequestBody>ctx.request.body;

        const mpSessionInfo = await wechatService.getUserMpSession(code);

        if (!mpSessionInfo.success) {
            return (ctx.body = {
                code: WEHCAT_MP_LOGIN_ERROR,
                message: mpSessionInfo.message
            });
        }

        const token = utils.crypto.md5(`${mpSessionInfo.data.openid}${Date.now()}`);
        let mpUserInfo = await ctx.model
            .from('ejyy_wechat_mp_user')
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_wechat_mp_user.union_id'
            )
            .where('ejyy_wechat_mp_user.open_id', mpSessionInfo.data.openid)
            .select(
                'ejyy_wechat_mp_user.id',
                'ejyy_wechat_mp_user.nick_name',
                'ejyy_wechat_mp_user.phone',
                'ejyy_wechat_mp_user.gender',
                'ejyy_wechat_mp_user.avatar_url',
                'ejyy_wechat_mp_user.signature',
                'ejyy_wechat_mp_user.intact',
                'ejyy_wechat_mp_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!mpUserInfo) {
            mpUserInfo = {
                open_id: mpSessionInfo.data.openid,
                union_id: mpSessionInfo.data.unionid,
                phone: null,
                created_at: Date.now()
            };

            const [id] = await ctx.model.from('ejyy_wechat_mp_user').insert(mpUserInfo);

            mpUserInfo.id = id;
            mpUserInfo.gender = 0;
            mpUserInfo.intact = INCOMPLETE_USER_INFO;
            mpUserInfo.signature = '不一定每天都很好，但每天都会有些小美好在等你';
            mpUserInfo.subscribed = false;

            delete mpUserInfo.open_id;
            delete mpUserInfo.union_id;

            await ctx.model.from('ejyy_wechat_mp_auth').insert({
                wechat_mp_user_id: mpUserInfo.id,
                token
            });
        } else {
            mpUserInfo.phone = utils.phone.hide(mpUserInfo.phone);

            await ctx.model
                .from('ejyy_wechat_mp_auth')
                .where({ wechat_mp_user_id: mpUserInfo.id })
                .update({
                    token
                });
        }

        await ctx.model.from('ejyy_wechat_mp_user_login').insert({
            wechat_mp_user_id: mpUserInfo.id,
            ip: ctx.request.ip,
            brand,
            model,
            system,
            platform,
            login_at: Date.now()
        });

        const communityInfo = await communityService(ctx.model, mpUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                userInfo: mpUserInfo,
                communityInfo
            }
        };
    }
};

export default MpUserLoginAction;
