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
import { SUCCESS, CAPTCHA_ERROR, PWD_ERROR } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

interface RequestBody {
    account: string;
    password: string;
    captcha: string;
}

const PcUserAccountLoginAction = <Action>{
    router: {
        path: '/user/account_login',
        method: 'post',
        authRequired: false
    },
    validator: {
        body: [
            {
                name: 'account',
                required: true,
                min: 4,
                max: 32
            },
            {
                name: 'password',
                required: true,
                max: 32
            },
            {
                name: 'captcha',
                required: true,
                length: 4
            }
        ]
    },
    response: async ctx => {
        const { account, password, captcha } = <RequestBody>ctx.request.body;

        if (!ctx.session.loginCaptcha || ctx.session.loginCaptcha !== captcha.toLowerCase()) {
            return (ctx.body = {
                code: CAPTCHA_ERROR,
                message: '验证码错误'
            });
        }

        delete ctx.session.loginCaptcha;

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
            .where('ejyy_property_company_user.account', account)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.account',
                'ejyy_property_company_user.password',
                'ejyy_property_company_user.open_id',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.department_id',
                'ejyy_property_company_user.job_id',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed',
                'ejyy_property_company_access.content'
            )
            .select(ctx.model.raw('IF(ejyy_property_company_admin.property_company_user_id, 1, 0) as admin'))
            .first();

        if (!pcUserInfo || pcUserInfo.password !== utils.crypto.md5(password)) {
            return (ctx.body = {
                code: PWD_ERROR,
                message: '密码错误或账号不存在'
            });
        }

        const token = utils.crypto.md5(`${pcUserInfo.openid}${Date.now()}`);

        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];

        delete pcUserInfo.openid;
        delete pcUserInfo.content;
        delete pcUserInfo.password;
        delete pcUserInfo.department_id;
        delete pcUserInfo.job_id;

        await ctx.model
            .from('ejyy_property_company_auth')
            .where({ property_company_user_id: pcUserInfo.id })
            .update({
                token
            });

        await ctx.model.from('ejyy_property_company_user_login').insert({
            property_company_user_id: pcUserInfo.id,
            ip: ctx.request.ip,
            user_agent: ctx.headers['user-agent'],
            login_at: Date.now()
        });

        const postInfo = await propertyCompanyService.postInfo(ctx.model, pcUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                userInfo: pcUserInfo,
                postInfo
            }
        };
    }
};

export default PcUserAccountLoginAction;
