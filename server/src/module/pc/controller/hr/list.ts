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
import { FALSE, TRUE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    name?: string;
    status?: typeof FALSE | typeof TRUE;
}

const PcHrListAction = <Action>{
    router: {
        path: '/hr/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'string',
                min: 2
            },
            {
                name: 'status',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, name, status } = <RequestBody>ctx.request.body;
        const where = {};

        if (name) {
            where['ejyy_property_company_user.real_name'] = name;
        }

        if (status !== undefined) {
            where['ejyy_property_company_user.leave_office'] = status;
        }

        const list = await ctx.model
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
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_property_company_user.id'))
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.leave_office',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_department.name as department',
                'ejyy_property_company_job.name as job',
                'ejyy_wechat_official_accounts_user.subscribed'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcHrListAction;
