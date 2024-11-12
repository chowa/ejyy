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
import { SUCCESS, UNBINDING_FAMILY_ILLEGAL } from '~/constant/code';
import { UNBINDING_BUILDING } from '~/constant/status';
import { OPEARTE_BY_FAMILY } from '~/constant/operate_type';
import { AUTHENTICTED_BY_FAMILY } from '~/constant/authenticated_type';

interface RequestBody {
    user_building_ids: number[];
    user_id: number;
}

const MpFamilyUnbindingAction = <Action>{
    router: {
        path: '/family/unbinding',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'user_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'user_building_ids',
                required: true,
                validator: ids => {
                    return Array.isArray(ids) && ids.every(id => /^\d+$/.test(id));
                }
            }
        ]
    },
    response: async ctx => {
        const { user_id, user_building_ids } = <RequestBody>ctx.request.body;

        const selfRegisterBuilding = await ctx.model
            .from('ejyy_user_building')
            .where('authenticated_user_id', ctx.mpUserInfo.id)
            .where('authenticated_type', AUTHENTICTED_BY_FAMILY)
            .select('building_id');
        const allowBuildingIds = selfRegisterBuilding.map(item => item.building_id);

        const userBuilding = await ctx.model
            .from('ejyy_user_building')
            .whereIn('id', user_building_ids)
            .select('building_id');
        const buildingIds = userBuilding.map(item => item.building_id);

        const allowUnbinding = buildingIds.every(id => {
            return allowBuildingIds.includes(id);
        });

        if (!allowUnbinding) {
            return (ctx.body = {
                code: UNBINDING_FAMILY_ILLEGAL,
                message: '操作失败，部分住宅信息非你授权'
            });
        }

        const affect = await ctx.model
            .from('ejyy_user_building')
            .update({ status: UNBINDING_BUILDING })
            .where({ wechat_mp_user_id: user_id })
            .whereIn('building_id', buildingIds);

        // 操作记录
        const history = [];
        const created_at = Date.now();

        user_building_ids.forEach(user_building_id => {
            history.push({
                user_building_id,
                wechat_mp_user_id: ctx.mpUserInfo.id,
                status: UNBINDING_BUILDING,
                operate_by: OPEARTE_BY_FAMILY,
                created_at
            });
        });
        await ctx.model.from('ejyy_user_building_operate_log').insert(history);

        ctx.body = {
            code: SUCCESS,
            data: {
                affect
            }
        };
    }
};

export default MpFamilyUnbindingAction;
