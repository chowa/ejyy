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

interface RequestBody {
    community_id: number;
    user_id: number;
    start?: number;
    end?: number;
}

const PcSignRecordAction = <Action>{
    router: {
        path: '/sign/record',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'user_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'start',
                regex: /^\d{13}$/
            },
            {
                name: 'end',
                regex: /^\d{13}$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, user_id, start, end } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_property_company_user')
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .leftJoin('ejyy_property_company_job', 'ejyy_property_company_job.id', 'ejyy_property_company_user.job_id')
            .where('ejyy_property_company_user.id', user_id)
            .select(
                'ejyy_property_company_user.id',
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
                'ejyy_property_company_job.name as job'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取考勤信息'
            });
        }

        const list = await ctx.model
            .from('ejyy_employee_sign_record')
            .where('community_id', community_id)
            .andWhere('created_by', user_id)
            .andWhere('date', '>=', start ? start : Date.now() - 7000 * 24 * 60 * 60)
            .andWhere('date', '<=', end ? end : Date.now())
            .select(
                'date',
                'begin',
                'begin_lat',
                'begin_lng',
                'begin_accuracy',
                'finish',
                'finish_lat',
                'finish_lng',
                'finish_accuracy'
            )
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                list
            }
        };
    }
};

export default PcSignRecordAction;
