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
import { ALLOT_REPAIR_STEP } from '~/constant/repair';
import {
    EjyyRepair,
    EjyyPropertyCompanyUser,
    EjyyBuildingInfo,
    EjyyCommunityInfo,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';

interface RequestParams {
    id: number;
}

const MpRepairDetailAction = <Action>{
    router: {
        path: '/repair/detail/:id',
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
        let mergeDetail = <EjyyRepair & EjyyBuildingInfo & EjyyCommunityInfo>null;

        const findDetail = async (repair_id: number): Promise<EjyyRepair & EjyyBuildingInfo & EjyyCommunityInfo> => {
            return await ctx.model
                .from('ejyy_repair')
                .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_repair.building_id')
                .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_repair.community_id')
                .where('ejyy_repair.id', repair_id)
                .andWhere('ejyy_repair.wechat_mp_user_id', ctx.mpUserInfo.id)
                .select(
                    'ejyy_repair.id',
                    'ejyy_repair.repair_type',
                    'ejyy_repair.building_id',
                    'ejyy_repair.description',
                    'ejyy_repair.repair_imgs',
                    'ejyy_repair.allot_user_id',
                    'ejyy_repair.alloted_at',
                    'ejyy_repair.dispose_user_id',
                    'ejyy_repair.dispose_reply',
                    'ejyy_repair.dispose_content',
                    'ejyy_repair.dispose_imgs',
                    'ejyy_repair.disposed_at',
                    'ejyy_repair.finished_at',
                    'ejyy_repair.merge_id',
                    'ejyy_repair.step',
                    'ejyy_repair.rate',
                    'ejyy_repair.rate_content',
                    'ejyy_repair.rated_at',
                    'ejyy_repair.created_at',
                    'ejyy_building_info.type',
                    'ejyy_building_info.area',
                    'ejyy_building_info.building',
                    'ejyy_building_info.unit',
                    'ejyy_building_info.number',
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

        const realDetail = <EjyyRepair & EjyyBuildingInfo & EjyyCommunityInfo>(
            (selfDetail.merge_id ? { ...mergeDetail, merge_id: selfDetail.merge_id } : selfDetail)
        );

        if (realDetail.step >= ALLOT_REPAIR_STEP) {
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
                repair_imgs: realDetail.repair_imgs ? realDetail.repair_imgs.split('#') : [],
                dispose_imgs: realDetail.dispose_imgs ? realDetail.dispose_imgs.split('#') : [],
                allotInfo,
                disposedInfo
            }
        };
    }
};

export default MpRepairDetailAction;
