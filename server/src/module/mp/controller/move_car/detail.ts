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
import {
    EjyyMoveCar,
    EjyyCommunityInfo,
    EjyyPropertyCompanyUser,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';

interface RequestParams {
    id: number;
}

const MpMoveCarDetailAction = <Action>{
    router: {
        path: '/move_car/detail/:id',
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
        let resInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;

        const info = <EjyyMoveCar & EjyyCommunityInfo>await ctx.model
            .from('ejyy_move_car')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_move_car.community_id')
            .select(
                'ejyy_move_car.id',
                'ejyy_move_car.car_number',
                'ejyy_move_car.move_reason',
                'ejyy_move_car.live_img',
                'ejyy_move_car.have_concat_info',
                'ejyy_move_car.response_user_id',
                'ejyy_move_car.response_content',
                'ejyy_move_car.responsed_at',
                'ejyy_move_car.created_at',
                'ejyy_community_info.name as community_name'
            )
            .where('ejyy_move_car.id', id)
            .where('ejyy_move_car.wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (info.response_user_id) {
            resInfo = await ctx.model
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
                .where('ejyy_property_company_user.id', info.response_user_id)
                .select(
                    'ejyy_property_company_user.avatar_url',
                    'ejyy_property_company_department.name as department',
                    'ejyy_property_company_job.name as job',
                    'ejyy_property_company_user.real_name'
                )
                .first();
        }

        delete info.response_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                ...info,
                resInfo
            }
        };
    }
};

export default MpMoveCarDetailAction;
