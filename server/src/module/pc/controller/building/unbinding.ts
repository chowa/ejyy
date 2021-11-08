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
import { BINDING_BUILDING, UNBINDING_BUILDING } from '~/constant/status';
import { OPEARTE_BY_COMPANY } from '~/constant/operate_type';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    building_id: number;
    community_id: number;
}

const PcBuildingUnbindingAction = <Action>{
    router: {
        path: '/building/unbinding',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'building_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { building_id, id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_user_building')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
            .where('ejyy_user_building.id', id)
            .andWhere('ejyy_user_building.building_id', building_id)
            .andWhere('ejyy_building_info.community_id', community_id)
            .select('ejyy_user_building.status')
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改固定资产绑定关系'
            });
        }

        if (detail.status !== BINDING_BUILDING) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '固定资产状态错误'
            });
        }

        const affect = await ctx.model
            .from('ejyy_user_building')
            .update({
                status: UNBINDING_BUILDING
            })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '修改固定资产绑定关系失败'
            });
        }

        const created_at = Date.now();

        await ctx.model.from('ejyy_user_building_operate_log').insert({
            user_building_id: id,
            property_company_user_id: ctx.pcUserInfo.id,
            status: UNBINDING_BUILDING,
            operate_by: OPEARTE_BY_COMPANY,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            message: '修改固定资产绑定关系成功',
            data: {
                created_at
            }
        };
    }
};

export default PcBuildingUnbindingAction;
