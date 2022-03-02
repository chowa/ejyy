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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
}

const PcOptionColleagueAction = <Action>{
    router: {
        path: '/option/colleague',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_property_company_user')
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .leftJoin('ejyy_property_company_job', 'ejyy_property_company_job.id', 'ejyy_property_company_user.job_id')
            .whereIn('ejyy_property_company_user.id', function() {
                this.from('ejyy_property_company_user_access_community')
                    .where('community_id', community_id)
                    .select('property_company_user_id');
            })
            .andWhere('ejyy_property_company_user.leave_office', FALSE)
            .select(
                'ejyy_property_company_department.name as department',
                'ejyy_property_company_user.department_id',
                'ejyy_property_company_job.name as job',
                'ejyy_property_company_user.job_id',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.id'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcOptionColleagueAction;
