/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, STATUS_ERROR, ACCOUNT_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';
import utils from '~/utils';

interface RequestBody {
    account: string;
    password: string;
    real_name: string;
    idcard: string;
    avatar_url: string;
    phone: string;
    department_id: number;
    job_id: number;
    community_access: number[];
    access_id: number;
}

const PcHrCreateAction = <Action>{
    router: {
        path: '/hr/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
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
                name: 'real_name',
                max: 8,
                required: true
            },
            {
                name: 'idcard',
                required: true,
                validator: val => utils.idcard.verify(val),
                message: '身份证校验失败'
            },
            {
                name: 'avatar_url',
                required: true,
                max: 128,
                validator: val => /^\/avatar\/[a-z0-9]{32}\.(jpg|jpeg|png)$/.test(val)
            },
            {
                name: 'phone',
                required: true,
                regex: /^1\d{10}$/
            },
            {
                name: 'department_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'job_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_access',
                required: true,
                min: 1,
                validator: val => Array.isArray(val) && val.every(id => /^\d+$/.test(id))
            },
            {
                name: 'access_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const {
            account,
            password,
            real_name,
            idcard,
            avatar_url,
            phone,
            department_id,
            job_id,
            access_id,
            community_access
        } = <RequestBody>ctx.request.body;

        const joinRecord = await ctx.model
            .from('ejyy_property_company_user')
            .where('phone', phone)
            .select();

        if (joinRecord.length === 1) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '公司存有当前人事信息，请通过离入职恢复信息'
            });
        }

        const hasJoinInfo = joinRecord.some(record => record.leave_office === FALSE);

        if (hasJoinInfo) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '员工未从上家公司办理离职手续，无法入职'
            });
        }

        const accountExist = await ctx.model
            .from('ejyy_property_company_user')
            .where('account', account)
            .first();

        if (accountExist) {
            return (ctx.body = {
                code: ACCOUNT_EXIST,
                message: '账号已存在，请重新设置'
            });
        }

        const selfAccessCommunity = await ctx.model
            .from('ejyy_property_company_user_access_community')
            .whereIn('community_id', community_access)
            .andWhere('property_company_user_id', ctx.pcUserInfo.id)
            .select('community_id');

        if (!selfAccessCommunity.every(({ community_id }) => community_access.includes(community_id))) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '非法使用权限范围外的小区访问权限'
            });
        }

        const isExistJob = await ctx.model
            .from('ejyy_property_company_job')
            .andWhere('id', job_id)
            .first();

        if (!isExistJob) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的任职岗位'
            });
        }

        const isExistDepartment = await ctx.model
            .from('ejyy_property_company_department')
            .andWhere('id', department_id)
            .first();

        if (!isExistDepartment) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的部门信息'
            });
        }

        const isExistAccess = await ctx.model
            .from('ejyy_property_company_access')
            .andWhere('id', access_id)
            .first();

        if (!isExistAccess) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的权限模板'
            });
        }

        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_property_company_user').insert({
            account,
            password: utils.crypto.md5(password),
            real_name,
            idcard,
            gender: utils.idcard.gender(idcard),
            avatar_url,
            phone,
            department_id,
            access_id,
            job_id,
            join_company_at: created_at,
            created_at,
            created_by: ctx.pcUserInfo.id,
            leave_office: FALSE
        });

        await ctx.model.from('ejyy_property_company_auth').insert({
            token: null,
            property_company_user_id: id
        });

        const data = community_access.map(community_id => {
            return {
                property_company_user_id: id,
                community_id
            };
        });

        await ctx.model.from('ejyy_property_company_user_access_community').insert(data);

        ctx.body = {
            code: SUCCESS,
            message: '新建人事信息成功',
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcHrCreateAction;
