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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';
import utils from '~/utils';

interface RequestBody {
    id: number;
    real_name: string;
    idcard: string;
    avatar_url: string;
    phone: string;
    department_id: number;
    job_id: number;
    community_access: number[];
    access_id: number;
}

const PcHrUpdateAction = <Action>{
    router: {
        path: '/hr/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'real_name',
                max: 8,
                required: true
            },
            {
                name: 'idcard',
                required: true,
                validator: val => utils.idcard.verify(val)
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
        const { id, real_name, idcard, avatar_url, phone, department_id, job_id, access_id, community_access } = <
            RequestBody
        >ctx.request.body;

        const info = await ctx.model
            .from('ejyy_property_company_user')
            .where('id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取人事信息'
            });
        }

        if (info.leave_office === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '人事状态错误'
            });
        }

        if (+id === ctx.pcUserInfo.id) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '禁止修改自己的人事信息'
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

        // 更新可访问小区，只判断当前人事的可操控小区是否与数据一致
        if (community_access.length > 0) {
            const selfAccessCommunity = await ctx.model
                .from('ejyy_property_company_user_access_community')
                .whereIn('community_id', community_access)
                .andWhere('property_company_user_id', ctx.pcUserInfo.id)
                .select('community_id');

            if (selfAccessCommunity.length !== community_access.length) {
                return (ctx.body = {
                    code: QUERY_ILLEFAL,
                    message: '非法修改权限范围外的小区访问权限'
                });
            }
        }

        const gender = utils.idcard.gender(idcard);

        const affect = await ctx.model
            .from('ejyy_property_company_user')
            .update({
                real_name,
                idcard,
                gender,
                avatar_url,
                phone,
                department_id,
                access_id,
                job_id
            })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '更新人事信息失败'
            });
        }

        await ctx.model
            .from('ejyy_property_company_user_access_community')
            .where('property_company_user_id', id)
            .delete();

        if (community_access.length > 0) {
            const data = community_access.map(community_id => {
                return {
                    property_company_user_id: id,
                    community_id
                };
            });

            await ctx.model.from('ejyy_property_company_user_access_community').insert(data);
        }

        ctx.body = {
            code: SUCCESS,
            message: '更新人事信息成功',
            data: {
                gender
            }
        };
    }
};

export default PcHrUpdateAction;
