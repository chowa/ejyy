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
import { SUCCESS, FITMENT_CREATE_FAIL, QUERY_ILLEFAL } from '~/constant/code';
import * as fitmentService from '~/service/fitment';
import { USER_SUBMIT_APPLY_STEP } from '~/constant/fitment';
import { BINDING_BUILDING } from '~/constant/status';

interface RequestBody {
    community_id: number;
    building_id: number;
}

const MpFitmentCreateAction = <Action>{
    router: {
        path: '/fitment/create',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'building_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, building_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_fitment')
            .where('community_id', community_id)
            .where('building_id', building_id)
            .whereNull('finished_at')
            .first();

        if (exist) {
            return (ctx.body = {
                code: FITMENT_CREATE_FAIL,
                message: '已有业主提交装修报备，请勿重复提交'
            });
        }

        const buildingInfo = await ctx.model
            .from('ejyy_building_info')
            .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
            .where('ejyy_building_info.community_id', community_id)
            .andWhere('ejyy_building_info.id', building_id)
            .andWhere('ejyy_user_building.wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ejyy_user_building.status', BINDING_BUILDING)
            .first();

        if (!buildingInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的建筑'
            });
        }

        const [id] = await ctx.model.from('ejyy_fitment').insert({
            community_id,
            building_id,
            step: USER_SUBMIT_APPLY_STEP,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            created_at: Date.now()
        });

        fitmentService.noticePropertyCompany(ctx.model, id);

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default MpFitmentCreateAction;
