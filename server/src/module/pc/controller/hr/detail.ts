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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}

const PcHrDetailAction = <Action>{
    router: {
        path: '/hr/detail/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        params: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const info = await ctx.model
            .from('ejyy_property_company_user')
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .leftJoin('ejyy_property_company_job', 'ejyy_property_company_job.id', 'ejyy_property_company_user.job_id')
            .leftJoin(
                'ejyy_property_company_access',
                'ejyy_property_company_access.id',
                'ejyy_property_company_user.access_id'
            )
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_property_company_user.union_id'
            )
            .where('ejyy_property_company_user.id', id)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.account',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.idcard',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_user.leave_office',
                'ejyy_property_company_user.department_id',
                'ejyy_property_company_user.job_id',
                'ejyy_property_company_user.leave_office',
                'ejyy_property_company_user.access_id',
                'ejyy_property_company_user.created_by',
                'ejyy_property_company_department.name as department',
                'ejyy_property_company_job.name as job',
                'ejyy_wechat_official_accounts_user.subscribed',
                'ejyy_property_company_access.name as access_name',
                'ejyy_property_company_access.content'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取人事信息'
            });
        }

        let createInfo = null;

        if (info.created_by) {
            createInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.created_by)
                .select('id', 'real_name')
                .first();
        }

        delete info.created_by;

        const communityList = await ctx.model
            .from('ejyy_property_company_user_access_community')
            .leftJoin(
                'ejyy_community_info',
                'ejyy_community_info.id',
                'ejyy_property_company_user_access_community.community_id'
            )
            .where('ejyy_property_company_user_access_community.property_company_user_id', id)
            .select('ejyy_community_info.name', 'ejyy_property_company_user_access_community.community_id');

        const joinRecord = await ctx.model
            .from('ejyy_property_company_user_join_record')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_property_company_user_join_record.created_by'
            )
            .where('ejyy_property_company_user_join_record.property_company_user_id', id)
            .select(
                'ejyy_property_company_user.id as operated_user_id',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user_join_record.status',
                'ejyy_property_company_user_join_record.created_at'
            )
            .orderBy('ejyy_property_company_user_join_record.id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                joinRecord,
                createInfo,
                communityList
            }
        };
    }
};

export default PcHrDetailAction;
