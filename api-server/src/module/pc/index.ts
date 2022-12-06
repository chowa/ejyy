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

import path from 'path';
import { Context } from 'koa';
import { Action } from '~/types/action';
import KoaRouter from 'koa-router';
import * as PcModuleRouter from './router';
import config from '~/config';
import validatorService from '~/service/validator';
import { PARAMS_ERROR, ACCESS_DENY, QUERY_ILLEFAL } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';
import cwlog from 'chowa-log';
import * as propertyCompanyService from '~/service/property_company';

function PcModule(appRouter: KoaRouter) {
    for (const name in PcModuleRouter) {
        const { router, validator, response } = <Action>PcModuleRouter[name];

        appRouter[router.method](path.posix.join('/pc', router.path), async (ctx: Context, next) => {
            if (router.authRequired) {
                const token = ctx.request.header['ejyy-pc-token'];

                if (!token) {
                    return (ctx.status = 401);
                }

                const pcUserInfo = await ctx.model
                    .table('ejyy_property_company_auth')
                    .leftJoin(
                        'ejyy_property_company_user',
                        'ejyy_property_company_user.id',
                        'ejyy_property_company_auth.property_company_user_id'
                    )
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
                    .where('ejyy_property_company_auth.token', token)
                    .where('ejyy_property_company_user.leave_office', FALSE)
                    .select(
                        'ejyy_property_company_user.id',
                        'ejyy_property_company_user.account',
                        'ejyy_property_company_user.real_name',
                        'ejyy_property_company_user.gender',
                        'ejyy_property_company_user.avatar_url',
                        'ejyy_property_company_user.phone',
                        'ejyy_property_company_user.department_id',
                        'ejyy_property_company_user.job_id',
                        'ejyy_property_company_user.join_company_at',
                        'ejyy_property_company_user.admin',
                        'ejyy_property_company_user.created_at',
                        'ejyy_wechat_official_accounts_user.subscribed',
                        'ejyy_property_company_access.content'
                    )
                    .first();

                if (!pcUserInfo) {
                    return (ctx.status = 401);
                }

                const access = pcUserInfo.content ? pcUserInfo.content : [];
                delete pcUserInfo.content;

                ctx.pcUserInfo = { ...pcUserInfo, access };

                // 权限 空数组就是admin才能访问
                if (Array.isArray(router.roles)) {
                    if (
                        !ctx.pcUserInfo.admin &&
                        !router.roles.includes(ROLE.ANYONE) &&
                        !router.roles.some(role => ctx.pcUserInfo.access.includes(role))
                    ) {
                        return (ctx.body = {
                            code: ACCESS_DENY,
                            message: '权限不足，无法访问'
                        });
                    }
                }

                if (router.verifyCommunity) {
                    const verifyCommunityRes = await propertyCompanyService.verifyCommunity(
                        ctx.model,
                        ctx.pcUserInfo.id,
                        ctx.request.body.community_id
                    );

                    if (!verifyCommunityRes) {
                        return (ctx.body = {
                            code: QUERY_ILLEFAL,
                            message: '操作非法'
                        });
                    }
                }
            }

            const vs = validatorService(ctx, validator);

            if (!vs.success) {
                return (ctx.body = {
                    code: PARAMS_ERROR,
                    message: vs.message
                });
            }

            await response.apply(this, [ctx, next]);
        });

        if (config.debug) {
            cwlog.info(`${name} mounted and request from ${path.posix.join('/pc', router.path)} by ${router.method}`);
        }
    }
}

export default PcModule;
