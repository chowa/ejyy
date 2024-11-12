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
import { SUCCESS, WEHCAT_MP_LOGIN_ERROR, ILLEGAL_PROPERTY_COMPANY_USER } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

interface RequestBody {
    code: string;
    brand?: string;
    model?: string;
    system?: string;
    platform?: string;
    encryptedData: string;
    iv: string;
}

const PcUserMpLoginAction = <Action>{
    router: {
        path: '/user/mp_login',
        method: 'post',
        authRequired: false
    },

    validator: {
        body: [
            {
                name: 'code',
                required: true,
                regex: /^[0-9a-zA-Z]{32}$/
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
            },
            {
                name: 'encryptedData',
                required: true
            },
            {
                name: 'iv',
                required: true
            }
        ]
    },

    response: async ctx => {
        const { code, encryptedData, iv, brand, model, system, platform } = <RequestBody>ctx.request.body;

        const phoneInfo = await wechatService.getUserMpPhone(code, iv, encryptedData);

        if (!phoneInfo.success) {
            return (ctx.body = {
                code: WEHCAT_MP_LOGIN_ERROR,
                message: phoneInfo.message
            });
        }

        let pcUserInfo = await ctx.model
            .table('ejyy_property_company_user')
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_property_company_user.union_id'
            )
            .leftJoin(
                'ejyy_property_company_access',
                'ejyy_property_company_access.id',
                'ejyy_property_company_user.access_id'
            )
            .where('ejyy_property_company_user.leave_office', FALSE)
            .where('ejyy_property_company_user.phone', phoneInfo.data.purePhoneNumber)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.account',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.admin',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed',
                'ejyy_property_company_access.content'
            )
            .first();

        if (!pcUserInfo) {
            return (ctx.body = {
                code: ILLEGAL_PROPERTY_COMPANY_USER,
                message: '未查询到任职信息'
            });
        }

        await ctx.model
            .from('ejyy_property_company_user')
            .update({
                open_id: phoneInfo.data.openid,
                union_id: phoneInfo.data.unionid
            })
            .where('id', pcUserInfo.id);

        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];
        delete pcUserInfo.content;

        const token = utils.crypto.md5(`${phoneInfo.data.openid}${Date.now()}`);
        await ctx.model
            .from('ejyy_property_company_auth')
            .where({ property_company_user_id: pcUserInfo.id })
            .update({
                token
            });

        await ctx.model.from('ejyy_property_company_user_login').insert({
            property_company_user_id: pcUserInfo.id,
            ip: ctx.request.ip,
            user_agent: `brand/${brand},model/${model},system/${system},platform/$${platform}`,
            login_at: Date.now()
        });

        const postInfo = await propertyCompanyService.postInfo(ctx.model, pcUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                postInfo,
                userInfo: pcUserInfo
            }
        };
    }
};

export default PcUserMpLoginAction;
