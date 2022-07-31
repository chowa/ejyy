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

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_COMPLAIN_STEP } from '~/constant/complain';

interface RequestParams {
    id: number;
}

import {
    EjyyComplain,
    EjyyPropertyCompanyUser,
    EjyyCommunityInfo,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';

const MpComplainDetailAction = <Action>{
    router: {
        path: '/complain/detail/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;
        let allotInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let disposedInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let mergeDetail = <EjyyComplain & EjyyCommunityInfo>null;

        const findDetail = async (compain_id: number): Promise<EjyyComplain & EjyyCommunityInfo> => {
            return await ctx.model
                .from('ejyy_complain')
                .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_complain.community_id')
                .where('ejyy_complain.id', compain_id)
                .andWhere('ejyy_complain.wechat_mp_user_id', ctx.mpUserInfo.id)
                .select(
                    'ejyy_complain.id',
                    'ejyy_complain.type',
                    'ejyy_complain.category',
                    'ejyy_complain.description',
                    'ejyy_complain.complain_imgs',
                    'ejyy_complain.allot_user_id',
                    'ejyy_complain.alloted_at',
                    'ejyy_complain.dispose_user_id',
                    'ejyy_complain.dispose_reply',
                    'ejyy_complain.dispose_content',
                    'ejyy_complain.dispose_imgs',
                    'ejyy_complain.disposed_at',
                    'ejyy_complain.finished_at',
                    'ejyy_complain.merge_id',
                    'ejyy_complain.step',
                    'ejyy_complain.rate',
                    'ejyy_complain.rate_content',
                    'ejyy_complain.rated_at',
                    'ejyy_complain.created_at',
                    'ejyy_community_info.name as community_name'
                )
                .first();
        };

        const selfDetail = await findDetail(id);

        if (!selfDetail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        // 如果工单被合并了
        if (selfDetail.merge_id) {
            mergeDetail = await findDetail(selfDetail.merge_id);
        }

        const realDetail = <EjyyComplain & EjyyCommunityInfo>(
            (selfDetail.merge_id ? { ...mergeDetail, merge_id: selfDetail.merge_id } : selfDetail)
        );

        if (realDetail.step >= ALLOT_COMPLAIN_STEP) {
            allotInfo = await ctx.model
                .from('ejyy_property_company_user')
                .leftJoin(
                    'ejyy_property_company_department',
                    'ejyy_property_company_department.id',
                    'ejyy_property_company_user.department_id'
                )
                .leftJoin(
                    'ejyy_property_company_job',
                    'ejyy_property_company_job.id',
                    'ejyy_property_company_user.job_id'
                )
                .where('ejyy_property_company_user.id', realDetail.allot_user_id)
                .select(
                    'ejyy_property_company_user.avatar_url',
                    'ejyy_property_company_user.phone',
                    'ejyy_property_company_department.name as department',
                    'ejyy_property_company_job.name as job',
                    'ejyy_property_company_user.real_name'
                )
                .first();

            disposedInfo = await ctx.model
                .from('ejyy_property_company_user')
                .leftJoin(
                    'ejyy_property_company_department',
                    'ejyy_property_company_department.id',
                    'ejyy_property_company_user.department_id'
                )
                .leftJoin(
                    'ejyy_property_company_job',
                    'ejyy_property_company_job.id',
                    'ejyy_property_company_user.job_id'
                )
                .where('ejyy_property_company_user.id', realDetail.dispose_user_id)
                .select(
                    'ejyy_property_company_user.avatar_url',
                    'ejyy_property_company_user.phone',
                    'ejyy_property_company_department.name as department',
                    'ejyy_property_company_job.name as job',
                    'ejyy_property_company_user.real_name'
                )
                .first();
        }

        delete realDetail.allot_user_id;
        delete realDetail.dispose_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                ...realDetail,
                complain_imgs: realDetail.complain_imgs ? realDetail.complain_imgs.split('#') : [],
                dispose_imgs: realDetail.dispose_imgs ? realDetail.dispose_imgs.split('#') : [],
                allotInfo,
                disposedInfo
            }
        };
    }
};

export default MpComplainDetailAction;
