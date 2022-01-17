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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';

interface RequestParams {
    id: number;
}

const PcColleagueDetailAction = <Action>{
    router: {
        path: '/colleague/detail/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
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
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_property_company_user.union_id'
            )
            .where('ejyy_property_company_user.id', id)
            .andWhere('ejyy_property_company_user.leave_office', FALSE)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_department.name as department',
                'ejyy_property_company_job.name as job',
                'ejyy_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取同事信息'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info
            }
        };
    }
};

export default PcColleagueDetailAction;
