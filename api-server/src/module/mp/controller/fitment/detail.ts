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
import { SUCCESS } from '~/constant/code';
import {
    EjyyFitment,
    EjyyCommunityInfo,
    EjyyBuildingInfo,
    EjyyCommunitySetting,
    EjyyPropertyCompanyUser,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';
import { PROPERTY_COMPANY_ALLOW_STEP, PROPERTY_COMPANY_CONFIRM_STEP } from '~/constant/fitment';

interface RequestParams {
    id: number;
}

const MpFitmentDetailAction = <Action>{
    router: {
        path: '/fitment/detail/:id',
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
        let agreeInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let confirmInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let returnInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;

        const detail = <EjyyFitment & EjyyCommunityInfo & EjyyBuildingInfo & EjyyCommunitySetting>await ctx.model
            .from('ejyy_fitment')
            .leftJoin('ejyy_community_setting', 'ejyy_community_setting.community_id', 'ejyy_fitment.community_id')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_fitment.community_id')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_fitment.building_id')
            .where('ejyy_fitment.id', id)
            .where('ejyy_fitment.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(
                'ejyy_community_setting.fitment_pledge',
                'ejyy_community_info.name as community_name',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number',
                'ejyy_fitment.id',
                'ejyy_fitment.step',
                'ejyy_fitment.agree_user_id',
                'ejyy_fitment.agreed_at',
                'ejyy_fitment.cash_deposit',
                'ejyy_fitment.finished_at',
                'ejyy_fitment.confirm_user_id',
                'ejyy_fitment.confirmed_at',
                'ejyy_fitment.return_name',
                'ejyy_fitment.return_bank',
                'ejyy_fitment.return_bank_id',
                'ejyy_fitment.return_operate_user_id',
                'ejyy_fitment.is_return_cash_deposit',
                'ejyy_fitment.returned_at',
                'ejyy_fitment.created_at'
            )
            .first();

        if (detail.step >= PROPERTY_COMPANY_ALLOW_STEP) {
            agreeInfo = await ctx.model
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
                .where('ejyy_property_company_user.id', detail.agree_user_id)
                .select(
                    'ejyy_property_company_user.avatar_url',
                    'ejyy_property_company_department.name as department',
                    'ejyy_property_company_job.name as job',
                    'ejyy_property_company_user.real_name'
                )
                .first();
        }

        if (detail.step >= PROPERTY_COMPANY_CONFIRM_STEP) {
            confirmInfo = await ctx.model
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
                .where('ejyy_property_company_user.id', detail.confirm_user_id)
                .select(
                    'ejyy_property_company_user.avatar_url',
                    'ejyy_property_company_department.name as department',
                    'ejyy_property_company_job.name as job',
                    'ejyy_property_company_user.real_name'
                )
                .first();

            if (detail.is_return_cash_deposit) {
                returnInfo = await ctx.model
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
                    .where('ejyy_property_company_user.id', detail.return_operate_user_id)
                    .select(
                        'ejyy_property_company_user.avatar_url',
                        'ejyy_property_company_department.name as department',
                        'ejyy_property_company_job.name as job',
                        'ejyy_property_company_user.real_name'
                    )
                    .first();
            }
        }

        delete detail.agree_user_id;
        delete detail.confirm_user_id;
        delete detail.return_operate_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                agreeInfo,
                confirmInfo,
                returnInfo
            }
        };
    }
};

export default MpFitmentDetailAction;
