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
            }
        ]
    },

    response: async ctx => {
        const { code, brand, model, system, platform } = <RequestBody>ctx.request.body;

        const pcSessionInfo = await wechatService.getPcMpSession(code);

        if (!pcSessionInfo.success) {
            return (ctx.body = {
                code: WEHCAT_MP_LOGIN_ERROR,
                message: pcSessionInfo.message
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
            .leftJoin(
                'ejyy_property_company_admin',
                'ejyy_property_company_admin.property_company_user_id',
                'ejyy_property_company_user.id'
            )
            .where('ejyy_property_company_user.leave_office', FALSE)
            .where('ejyy_property_company_user.union_id', pcSessionInfo.data.unionid)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.account',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed',
                'ejyy_property_company_access.content'
            )
            .select(ctx.model.raw('IF(ejyy_property_company_admin.property_company_user_id, 1, 0) as admin'))
            .first();

        if (!pcUserInfo) {
            return (ctx.body = {
                code: ILLEGAL_PROPERTY_COMPANY_USER,
                message: '未查询到任职信息'
            });
        }

        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];
        delete pcUserInfo.content;

        const token = utils.crypto.md5(`${pcSessionInfo.data.openid}${Date.now()}`);
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
