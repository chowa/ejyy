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
import { SUCCESS, WECHAT_STATE_ILLEGAL, WEHCAT_WEB_LOGIN_FAIL, ACCOUNT_NOT_EXIST } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

interface RequestBody {
    code: string;
    state: string;
}

const PcUserWechatLoginAction = <Action>{
    router: {
        path: '/user/wechat_login',
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
                name: 'state',
                required: true,
                regex: /^[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$/
            }
        ]
    },
    response: async ctx => {
        const { code, state } = <RequestBody>ctx.request.body;

        if (!ctx.session.state || ctx.session.state !== state) {
            return (ctx.body = {
                code: WECHAT_STATE_ILLEGAL,
                message: '授权码错误'
            });
        }

        delete ctx.session.state;

        const webUserInfo = await wechatService.getWebUserInfo(code);

        if (!webUserInfo.success) {
            return (ctx.body = {
                code: WEHCAT_WEB_LOGIN_FAIL,
                message: webUserInfo.message
            });
        }

        const token = utils.crypto.md5(`${webUserInfo.data.openid}${Date.now()}`);
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
            .where('ejyy_property_company_user.open_id', webUserInfo.data.openid)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.account',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.admin',
                'ejyy_property_company_user.department_id',
                'ejyy_property_company_user.job_id',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed',
                'ejyy_property_company_access.content'
            )
            .first();

        if (!pcUserInfo) {
            return (ctx.body = {
                code: ACCOUNT_NOT_EXIST,
                message: '账号不存在'
            });
        } else {
            pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
            pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];
            delete pcUserInfo.content;
            delete pcUserInfo.department_id;
            delete pcUserInfo.job_id;

            await ctx.model
                .from('ejyy_property_company_auth')
                .where({ property_company_user_id: pcUserInfo.id })
                .update({
                    token
                });
        }

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

export default PcUserWechatLoginAction;
